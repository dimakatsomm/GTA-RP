import 'dotenv/config';
import { connect, RetentionPolicy, StorageType } from 'nats';
import { Redis } from 'ioredis';
import Fastify from 'fastify';
import { healthzPlugin } from './healthz.js';

const NATS_URL = process.env['NATS_URL'] ?? 'nats://localhost:4222';
const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const NATS_STREAM = process.env['NATS_STREAM'] ?? 'gtarp';
const PORT = Number(process.env['EVENT_WORKER_PORT'] ?? 3003);

// 7 days expressed in nanoseconds (NATS JetStream max_age unit).
const SEVEN_DAYS_NS = 7 * 24 * 60 * 60 * 1_000_000_000;

async function main() {
  // ── NATS ─────────────────────────────────────────────────────────────────
  const nc = await connect({ servers: NATS_URL });
  console.log(`[event-worker] Connected to NATS: ${NATS_URL}`);

  const jsm = await nc.jetstreamManager();

  // Create the gtarp JetStream stream if it does not yet exist.
  try {
    await jsm.streams.info(NATS_STREAM);
    console.log(`[event-worker] JetStream stream "${NATS_STREAM}" exists`);
  } catch {
    await jsm.streams.add({
      name: NATS_STREAM,
      subjects: [`${NATS_STREAM}.>`],
      retention: RetentionPolicy.Limits,
      storage: StorageType.File,
      max_age: SEVEN_DAYS_NS,
    });
    console.log(`[event-worker] Created JetStream stream "${NATS_STREAM}"`);
  }

  // ── Redis ─────────────────────────────────────────────────────────────────
  const redis = new Redis(REDIS_URL);
  redis.on('connect', () => console.log(`[event-worker] Connected to Redis: ${REDIS_URL}`));
  redis.on('error', (err: Error) => console.error('[event-worker] Redis error:', err));

  // ── Heartbeat ─────────────────────────────────────────────────────────────
  const heartbeat = setInterval(() => {
    console.log(`[event-worker] heartbeat ${new Date().toISOString()}`);
  }, 30_000);

  // ── HTTP /healthz ─────────────────────────────────────────────────────────
  const app = Fastify({ logger: false });
  await app.register(healthzPlugin);
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[event-worker] /healthz listening on port ${PORT}`);

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async () => {
    console.log('[event-worker] SIGTERM received — shutting down');
    clearInterval(heartbeat);
    await app.close();
    redis.disconnect();
    await nc.drain();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

main().catch((err: unknown) => {
  console.error('[event-worker] Fatal error:', err);
  process.exit(1);
});
