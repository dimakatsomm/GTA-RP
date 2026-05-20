# ADR-0004: AI cost tiering

- Status: Accepted
- Date: 2026-05-19

## Context

AI cost explosion is the #1 project risk (per vision doc). With ~100 concurrent players generating dispatch chatter, witness statements, news, gang dialogue, and arc seeds, naive use of frontier models hits four-digit-USD-per-day fast.

## Decision

All generation flows through `ai-orchestrator`, which selects a model tier:

| Tier | Provider/Model               | Use case                                          | Budget guard |
|------|------------------------------|---------------------------------------------------|--------------|
| 0    | Deterministic templates      | Dispatch boilerplate, headline stubs, minor NPCs  | unlimited    |
| 1    | Haiku 4.5 / GPT-4o-mini      | Short reactive lines, snippets                    | cheap        |
| 2    | Sonnet 4.6 / GPT-4o          | Witness statements, story arcs, news bodies      | metered      |
| 3    | Opus 4.7                     | Season-defining moments, major scandals           | ADR-gated    |

Rules:

- Default to Tier 0. PR must justify promotion.
- Cache layer (Redis + pgvector semantic key) sits in front of every tier ≥ 1.
- Hit rate target: **≥ 70%** before features ship to live.
- Per-player budget: **20,000 tokens / hour**. Per-server budget: **2M tokens / hour**. Exceed → automatic degradation to next-lower tier; if Tier 0, return cached or canned response.
- Tier 3 calls require:
  - Capped concurrency (1 in-flight per server).
  - ADR or written justification.
  - Recorded in `AiUsage` with `tier=3` and reviewed weekly.

## Consequences

Positive:
- Hard ceiling on cost regardless of player count spikes.
- Cache-first design makes scale-out cheap.

Negative:
- Tier 0 templates require investment in SA-content lexicon — fewer "magic" emergent lines.
- Cache key engineering is real work; bad keys = low hit rate.

## Review

Re-evaluate quarterly or when model pricing changes by >25%.
