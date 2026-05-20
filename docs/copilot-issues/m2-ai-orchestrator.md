# M2 — AI Orchestrator

Depends on: M1.

---

## [M2] OpenAI adapter in @gtarp/ai-clients

**Objective**: Implement `TextProvider` and `VoiceProvider` against OpenAI.

Scope:
- [ ] Streaming + non-streaming text.
- [ ] Per-call usage metadata returned in `GenerationResult`.
- [ ] Retry with exponential backoff for 429/5xx.
- [ ] No prompt logging by default (privacy); behind feature flag.

Files: `packages/ai-clients/src/providers/openai.ts`.

AI cost note: only used at Tier 1+. Default routing prefers Anthropic on Tier 2/3; OpenAI is the fallback.

---

## [M2] Anthropic adapter in @gtarp/ai-clients

**Objective**: Implement `TextProvider` against Anthropic with prompt caching enabled by default.

Scope:
- [ ] `cache_control: ephemeral` on system + stable user prefix.
- [ ] Surfaces `cache_creation_input_tokens` + `cache_read_input_tokens` in `GenerationResult`.
- [ ] Cost calc respects cached-token pricing.

AI cost note: Prompt cache is the single biggest cost lever — get the cache breakpoints right (see Anthropic prompt caching docs).

Files: `packages/ai-clients/src/providers/anthropic.ts`.

---

## [M2] ElevenLabs voice adapter

**Objective**: Implement `VoiceProvider` against ElevenLabs.

Scope:
- [ ] Per-voice-id caching — same `(voiceId, text)` returns cached MP3 from S3/local fs.
- [ ] Cost calc by characters synthesized.
- [ ] Hard cap: 1500 chars/call.

Files: `packages/ai-clients/src/providers/elevenlabs.ts`.

---

## [M2] Template provider (Tier 0)

**Objective**: Deterministic template engine for Tier 0. Reads `.tmpl` files with `{{var}}` placeholders + a small DSL (`{{slang.casual}}`, `{{name.surname}}`).

Scope:
- [ ] Templates live in `packages/sa-content/src/templates/<purpose>/<id>.tmpl`.
- [ ] Random selection seeded by `cacheKey` for repeatability.
- [ ] At least 10 dispatch boilerplate templates + 5 news-headline templates seeded.

GTA-first: Tier 0 absorbs >60% of generation calls — protects the budget that makes the rest of the AI city possible.

Files: `packages/ai-clients/src/providers/template.ts`, `packages/sa-content/src/templates/**`.

---

## [M2] Tiered model router

**Objective**: `ai-orchestrator` chooses provider/model by tier + falls through to lower tiers when budget exceeded.

Scope:
- [ ] Reads tier from request.
- [ ] Checks per-player + per-server token budget in Redis (sliding 1h window).
- [ ] Logs every call into `AiUsage`.
- [ ] Returns `{ usedTier, requestedTier, degraded: bool }` in response metadata.

Acceptance: synthetic load test shows automatic Tier 2 → Tier 1 degradation when player budget exceeded.

Files: `apps/ai-orchestrator/src/router.ts`.

---

## [M2] Cache: exact-match + semantic

**Objective**: Two-layer cache in front of every Tier ≥ 1 call.

Scope:
- [ ] L1 exact: Redis key = sha256(provider + model + system + user + maxTokens + temperature). TTL = purpose-configurable (default 24h).
- [ ] L2 semantic: pgvector embedding of `user` part. Cosine similarity > 0.92 = hit. Falls back to L1 miss otherwise.
- [ ] Embedding model: cheapest available; cached itself.
- [ ] Hit/miss telemetry tagged by purpose.

Acceptance: target cache hit rate ≥ 70% within first 1000 calls in synthetic test.

Files: `apps/ai-orchestrator/src/cache/**`.

---

## [M2] Budget guard middleware

**Objective**: Fastify middleware enforces per-player and per-server token budgets.

Scope:
- [ ] Env-driven limits (see `.env.example`).
- [ ] On exceed: degrade request to next-lower tier; if Tier 0, return canned template result with `degraded: true`.
- [ ] Per-player budget keyed by `request.playerId` header.

Files: `apps/ai-orchestrator/src/middleware/budget.ts`.

---

## [M2] Cost telemetry → Grafana

**Objective**: Aggregated cost board.

Scope:
- [ ] `AiUsage` rows surfaced via `/metrics` (Prometheus) and `/admin/ai-usage` (JSON).
- [ ] Grafana JSON dashboard committed to `infra/grafana/dashboards/ai-cost.json`.
- [ ] Single graph: cost/hour split by tier + purpose. Single counter: rolling 24h cost.

Files: `infra/grafana/dashboards/ai-cost.json`, `apps/ai-orchestrator/src/admin/**`.
