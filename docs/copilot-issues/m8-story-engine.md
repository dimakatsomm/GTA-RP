# M8 — AI Story Engine

Depends on: M7.

---

## [M8] Story engine worker — pattern detection

**Objective**: Worker scans `EventLog` stream for arc-trigger patterns.

Scope:
- [ ] Pattern library (declarative): gang_war, revenge, corruption_scandal, missing_persons, political_conspiracy, smuggling_route, turf_war.
- [ ] Each pattern is a typed Zod schema + matcher fn against rolling event windows.
- [ ] Matched patterns emit `arc.proposed` event.

GTA-first: the city writes its own *chaos* — emergent storytelling is the moat.

Files: `apps/event-worker/src/engines/story/patterns/**`, schema additions.

---

## [M8] Arc generator (Tier 2/3)

**Objective**: For each `arc.proposed`, generate a 3-5 beat arc proposal.

Scope:
- [ ] Tier 2 for routine arcs; Tier 3 for major scandals (capped: 2/server/week).
- [ ] Output schema: title, summary, beats[], suggested-NPCs, dispatch hooks, news-hook.
- [ ] Persisted to `StoryArc` table (new schema migration).

Files: `apps/event-worker/src/engines/story/generator.ts`.

---

## [M8] Admin dashboard: approve / edit / inject

**Objective**: Web admin page lists proposed arcs; mods approve, edit, or reject.

Scope:
- [ ] `/admin/arcs` page in `apps/web`.
- [ ] Approval injects arc beats as scheduled events (dispatch tips, NPC placements, news hooks).
- [ ] Audit log of mod decisions.

Files: `apps/web/src/admin/arcs/**`.

---

## [M8] In-game hooks for arc beats

**Objective**: Beat scheduler runs in event-worker; injects beats into the world at chosen times.

Scope:
- [ ] Beat types: anonymous tip (publishes `dispatch.requested`), planted evidence (creates Evidence row at a Crime), NPC placement (spawns ped at coords with persona), news drop (creates NewsEvent row).
- [ ] Idempotent execution; misses are not retried after the beat window.

Files: `apps/event-worker/src/engines/story/scheduler.ts`.
