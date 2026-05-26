# Copilot Multi-Agent Execution Queue

This file operationalizes `docs/copilot-issues/` as a milestone queue (not one batch implementation).

## Global execution rules

1. Milestones are strict-order: **M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9**.
2. Keep one concern per PR (`AGENTS.md`).
3. Parallelize only when file ownership is clean.
4. Serialize changes touching shared schema, event contracts, migrations, or shared AI routing.
5. Merge foundations first, then fan out.

## PR slicing by milestone

### M0

- PR 1: install, lockfile, Husky, Lua CI baseline
- PR 2: `apps/web` stub
- PR 3: `apps/backend` stub
- PR 4: `apps/event-worker` stub
- PR 5: `apps/ai-orchestrator` stub
- PR 6: `apps/discord-bot` stub
- Final pass: milestone validation after all M0 PRs merge

### M1

- PR 1: M1-A Prisma migration
- PR 2: M1-B seed data
- PR 3: M1-C `@gtarp/event-bus`
- PR 4: M1-D backend `/events`
- PR 5: M1-F BullMQ bridge + metrics
- PR 6: M1-E reputation engine
- Final pass: end-to-end acceptance PR only if cross-cutting gaps remain

### M2

- Provider PRs: OpenAI, Anthropic, ElevenLabs, Tier 0 templates
- Then: tier router, cache, budget guard, telemetry
- Keep provider adapters separate from cache/router/budget concerns

### M3

Use separate PRs by surface:

- FiveM bootstrap
- dispatch resource
- dispatch engine
- witness resource
- witness generation pipeline
- crime resources
- police MDT
- Discord bot expansion
- web vision site v1

Final pass: ship-gate verification after all M3 PRs merge.

### M4–M9

Use one PR per `## [M<...>]` section in each `m*.md` issue file.

## Agent model

- One coordinating agent per active milestone.
- Multiple implementation agents only for low-overlap sections.
- One reviewer/validation agent after each milestone wave.
- Avoid parallel implementation agents on the same package unless dependency order is resolved.

## Concrete execution queue (M0–M2)

### M0 queue

1. Branch `m0/foundation-tooling` — Title: `[M0] Finalize install lockfile hooks and Lua CI baseline`
2. Branch `m0/web-stub` — Title: `[M0] Scaffold apps/web static vision stub`
3. Branch `m0/backend-stub` — Title: `[M0] Add backend health service stub`
4. Branch `m0/event-worker-stub` — Title: `[M0] Add event-worker connectivity stub`
5. Branch `m0/ai-orchestrator-stub` — Title: `[M0] Add AI orchestrator 501 contract stub`
6. Branch `m0/discord-bot-stub` — Title: `[M0] Add Discord bot ping/login-safe stub`
7. Branch `m0/validation` — Title: `[M0] Run full milestone validation and smoke checks`

### M1 queue

1. Branch `m1/prisma-init-migration` — Title: `[M1-A] Apply initial Prisma migration and CI deploy step`
2. Branch `m1/seed-sa-data` — Title: `[M1-B] Add idempotent SA-flavored seed data`
3. Branch `m1/event-bus-package` — Title: `[M1-C] Implement JetStream-backed event-bus package`
4. Branch `m1/backend-events-ingest` — Title: `[M1-D] Add authenticated backend /events ingest endpoint`
5. Branch `m1/bullmq-bridge-metrics` — Title: `[M1-F] Add BullMQ bridge idempotency and metrics`
6. Branch `m1/reputation-engine-v1` — Title: `[M1-E] Implement reputation engine scoring and consumers`
7. Branch `m1/e2e-acceptance` — Title: `[M1] Add cross-cutting E2E acceptance closure`

### M2 queue

1. Branch `m2/openai-adapter` — Title: `[M2] Implement OpenAI adapter in @gtarp/ai-clients`
2. Branch `m2/anthropic-adapter` — Title: `[M2] Implement Anthropic adapter in @gtarp/ai-clients`
3. Branch `m2/elevenlabs-adapter` — Title: `[M2] Implement ElevenLabs voice adapter`
4. Branch `m2/tier0-template-provider` — Title: `[M2] Implement Tier 0 template provider`
5. Branch `m2/tier-router` — Title: `[M2] Implement tiered model router with degradation metadata`
6. Branch `m2/cache-l1-l2` — Title: `[M2] Implement exact and semantic generation cache layers`
7. Branch `m2/budget-guard` — Title: `[M2] Add budget guard middleware and per-player limits`
8. Branch `m2/cost-telemetry` — Title: `[M2] Add AI usage metrics endpoint and Grafana dashboard`
