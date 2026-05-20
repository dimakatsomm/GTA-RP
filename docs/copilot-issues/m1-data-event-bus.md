# M1 — Data Model & Event Bus

Depends on: M0 complete.

---

## [M1] Apply initial Prisma migration

**Objective**: Generate and apply the initial migration from the schema committed in M0.

Scope:
- [ ] `pnpm -F @gtarp/db prisma migrate dev -n init`.
- [ ] Commit `packages/db/prisma/migrations/`.
- [ ] CI runs `prisma migrate deploy` against the test Postgres service.

Files: `packages/db/prisma/migrations/**`.

---

## [M1] Seed script with SA-flavored sample data

**Objective**: Extend `packages/db/prisma/seed.ts` to cover at least: 20 territories, 10 sample businesses, 4 gangs, 6 sample players, 3 families.

Scope:
- [ ] All names + areas from `@gtarp/sa-content` only.
- [ ] `pnpm -F @gtarp/db seed` idempotent.
- [ ] Add npm script + CI smoke test that seeds, queries one row, exits.

Files: `packages/db/prisma/seed.ts`.

---

## [M1] NATS JetStream setup helper

**Objective**: Reusable bootstrap function that ensures the `gtarp` stream exists with subjects `gtarp.>` and durable retention.

Scope:
- [ ] New package `packages/event-bus`.
- [ ] Exports `connect()`, `publish(event)`, `subscribe(subject, handler)`.
- [ ] Validates events against `@gtarp/event-schema` before publishing — invalid events throw.
- [ ] Vitest contract test using NATS in CI service container.

Files: `packages/event-bus/**`.

GTA-first: All gameplay mutations route through this bus — it is the city's memory.

---

## [M1] Event publisher SDK in backend

**Objective**: Backend exposes typed `eventBus` instance and a thin HTTP endpoint `/events` for FiveM resources to publish.

Scope:
- [ ] Auth: shared secret header (FIVEM_INGEST_TOKEN) — temporary, will become mTLS in M9.
- [ ] Rate limit: 50 events/sec/source.
- [ ] Every accepted event written to `EventLog` AND published to NATS.

Files: `apps/backend/src/routes/events.ts`.

---

## [M1] BullMQ worker scaffold in apps/event-worker

**Objective**: Worker registers a Redis-backed queue per consumer (`reputation`, `story`, `media`, `gang`, `economy`, `dispatch`). Workers consume NATS subjects and enqueue jobs.

Scope:
- [ ] Bridge: `subscribe(gtarp.*) → enqueue(<consumer>, event)`.
- [ ] Idempotency: each event id deduped via Redis SETNX with 24h TTL.
- [ ] Telemetry: per-queue counters exposed via `/metrics` (Prometheus text format).

Files: `apps/event-worker/**`.

---

## [M1] Reputation engine v1

**Objective**: Worker consumes `crime.committed`, `arrest.made`, `bribe.accepted`, `territory.lost`, `business.robbed` and updates `Reputation` rows.

Scope:
- [ ] Deterministic scoring table in `apps/event-worker/src/engines/reputation/scoring.ts` (no AI).
- [ ] Updates per-player, per-family (if any), per-gang (if any), per-area scores.
- [ ] Unit tests on scoring table.
- [ ] Integration test: publish a crime, assert reputation row updated.

GTA-first: Reputation is the persistent layer that makes crime *matter* across sessions.

Files: `apps/event-worker/src/engines/reputation/**`.
