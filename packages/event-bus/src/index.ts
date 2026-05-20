import {
  connect as natsConnect,
  StringCodec,
  RetentionPolicy,
  StorageType,
  DeliverPolicy,
  nanos,
  consumerOpts,
  type NatsConnection,
  type JetStreamClient,
  type JetStreamManager,
  type JetStreamSubscription,
  type JsMsg,
  type StreamConfig,
} from 'nats';
import { DomainEvent } from '@gtarp/event-schema';
import type { ZodError } from 'zod';

export class EventValidationError extends Error {
  constructor(public override readonly cause: ZodError) {
    super(`EventValidationError: ${cause.message}`);
    this.name = 'EventValidationError';
  }
}

export interface SubscribeOpts {
  durableName?: string;
  deliverPolicy?: 'all' | 'new' | 'last';
}

export interface EventBus {
  publish(event: DomainEvent): Promise<{ seq: number }>;
  subscribe(
    subjectPattern: string,
    handler: (evt: DomainEvent, msg: JsMsg) => Promise<void>,
    opts?: SubscribeOpts,
  ): Promise<JetStreamSubscription>;
  ensureStream(name?: string, subjects?: string[]): Promise<void>;
  close(): Promise<void>;
}

const STREAM_NAME = 'gtarp';
const STREAM_SUBJECTS = ['gtarp.>'];
const sc = StringCodec();

export async function connect(opts?: { servers?: string | string[] }): Promise<EventBus> {
  const nc: NatsConnection = await natsConnect({
    servers: opts?.servers ?? process.env['NATS_URL'] ?? 'nats://localhost:4222',
  });
  const js: JetStreamClient = nc.jetstream();
  const jsm: JetStreamManager = await nc.jetstreamManager();

  await _ensureStream(jsm, STREAM_NAME, STREAM_SUBJECTS);

  const bus: EventBus = {
    async publish(event: DomainEvent): Promise<{ seq: number }> {
      const parsed = DomainEvent.safeParse(event);
      if (!parsed.success) {
        throw new EventValidationError(parsed.error);
      }
      const subject = `gtarp.${parsed.data.type}`;
      const pubAck = await js.publish(subject, sc.encode(JSON.stringify(parsed.data)), {
        msgID: parsed.data.id,
      });
      return { seq: pubAck.seq };
    },

    async subscribe(
      subjectPattern: string,
      handler: (evt: DomainEvent, msg: JsMsg) => Promise<void>,
      subscribeOpts?: SubscribeOpts,
    ): Promise<JetStreamSubscription> {
      const durableName =
        subscribeOpts?.durableName ?? subjectPattern.replace(/[^a-zA-Z0-9_-]/g, '_');

      const deliverPolicyMap: Record<NonNullable<SubscribeOpts['deliverPolicy']>, DeliverPolicy> = {
        all: DeliverPolicy.All,
        new: DeliverPolicy.New,
        last: DeliverPolicy.Last,
      };
      const deliverPolicy = deliverPolicyMap[subscribeOpts?.deliverPolicy ?? 'all'];

      const copts = consumerOpts();
      copts.durable(durableName);
      copts.ackExplicit();
      copts.maxDeliver(5);
      copts.ackWait(30_000); // 30s in millis
      copts.filterSubject(subjectPattern);
      copts.manualAck();
      copts.bindStream(STREAM_NAME);

      if (deliverPolicy === DeliverPolicy.All) {
        copts.deliverAll();
      } else if (deliverPolicy === DeliverPolicy.New) {
        copts.deliverNew();
      } else if (deliverPolicy === DeliverPolicy.Last) {
        copts.deliverLast();
      }

      const sub = await js.subscribe(subjectPattern, copts);

      void (async () => {
        for await (const msg of sub) {
          try {
            const raw: unknown = JSON.parse(sc.decode(msg.data));
            const parsed = DomainEvent.safeParse(raw);
            if (!parsed.success) {
              const dlqSubject = `${msg.subject}.dlq`;
              try {
                await js.publish(dlqSubject, msg.data);
              } catch {
                // best-effort DLQ publish
              }
              msg.ack();
              continue;
            }
            await handler(parsed.data, msg);
          } catch (err) {
            // Handler error — do not ack, allow redelivery up to maxDeliver
            console.error('[event-bus] handler error', err);
          }
        }
      })();

      return sub;
    },

    async ensureStream(name = STREAM_NAME, subjects = STREAM_SUBJECTS): Promise<void> {
      await _ensureStream(jsm, name, subjects);
    },

    async close(): Promise<void> {
      await nc.drain();
    },
  };

  return bus;
}

async function _ensureStream(
  jsm: JetStreamManager,
  name: string,
  subjects: string[],
): Promise<void> {
  const streamConfig: Partial<StreamConfig> = {
    name,
    subjects,
    retention: RetentionPolicy.Limits,
    storage: StorageType.File,
    max_age: nanos(30 * 24 * 60 * 60 * 1_000), // 30 days in nanoseconds
  };
  try {
    await jsm.streams.info(name);
    await jsm.streams.update(name, streamConfig);
  } catch {
    await jsm.streams.add(streamConfig);
  }
}
