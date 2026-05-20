# ADR-0003: Event bus — NATS JetStream

- Status: Accepted
- Date: 2026-05-19

## Context

Event-first architecture is core. We need durable streams (city "memory"), fan-out to many consumers (story, gang AI, media, economy, reputation, dispatch), and predictable ops cost.

Candidates:

- **NATS JetStream** — lightweight, single binary, durable streams, native pub/sub + queue groups, low operator burden.
- **Kafka / Redpanda** — industry default, but ZK/KRaft + tiered storage + tooling costs are heavy for early scale.
- **Redis Streams** — simple, but weak durability and no native at-least-once semantics across consumer groups.
- **RabbitMQ** — solid, but routing model is heavier than we need.

## Decision

NATS JetStream for the domain event bus. Redis + BullMQ for **work queues** (rate-limited background jobs like voice synthesis, image gen, retries).

## Consequences

Positive:
- Single small dep for events. Operators manage one process.
- Subject hierarchy (`gtarp.<event-type>`) makes consumer routing trivial.
- Native replay supports backfilling new consumers from history.

Negative:
- Smaller community than Kafka; fewer pre-built connectors.
- If we later need multi-region, migration plan needed.

Migration path: if NATS hits limits, swap to Redpanda using the same Zod contracts in `@gtarp/event-schema`.
