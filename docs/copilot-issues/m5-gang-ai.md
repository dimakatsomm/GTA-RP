# M5 — Gang AI & Territory

Depends on: M4.

---

## [M5] Gang + Territory + Alliance gameplay

**Objective**: Player-facing systems to form gangs, claim territory, and negotiate alliances.

Scope:
- [ ] Gang founding cost + min member count.
- [ ] Territory claim ritual (must hold area for N hours uncontested).
- [ ] Alliance / ceasefire / vendetta declared via in-game phone menu.

Files: `apps/fivem-resources/[crime]/gangs/**`, backend services.

---

## [M5] Gang AI: recruitment

**Objective**: AI worker recruits NPC members to gangs based on territory strength.

Scope:
- [ ] Recruitment rate = f(territory control, reputation, recent victories).
- [ ] NPC gangs (`Top Six`, `Iron Hand`, `Khanyisa`) seeded from lore bible.

Files: `apps/event-worker/src/engines/gang/recruitment.ts`.

---

## [M5] Gang AI: retaliation arcs

**Objective**: Patterns of `crime.committed` against one gang trigger retaliation arcs.

Scope:
- [ ] Pattern detector: ≥3 hostile events within rolling 24h window.
- [ ] Arc generator (Tier 2, ADR-budgeted): produces named retaliation hit; arc persisted as `StoryArc` row.
- [ ] Arc dispatches a `dispatch.requested` (anonymous tip) to police 30-90 min after arc start, creating PvP tension.

Files: `apps/event-worker/src/engines/gang/retaliation.ts`.

---

## [M5] Gang AI: alliance / betrayal generation

**Objective**: AI proposes alliance / ceasefire / betrayal arcs when relationship pressure thresholds hit.

Scope:
- [ ] Tier 1 generation for short proposals.
- [ ] Players must accept/reject in-game; AI proposals also delivered to NPC gangs deterministically.

Files: `apps/event-worker/src/engines/gang/diplomacy.ts`.

---

## [M5] Territory heatmap + control mechanics

**Objective**: Web dashboard + in-game map overlay of territory control by gang.

Scope:
- [ ] Web page in `apps/web/admin/territories`.
- [ ] In-game minimap blip color encodes controller.
- [ ] Control decays without activity.

Files: `apps/web/src/admin/territories/**`, `apps/fivem-resources/[crime]/gangs/territory_overlay.lua`.

---

## [M5] Informant system

**Objective**: NPCs and players can become informants to police.

Scope:
- [ ] NPC: recruited automatically from low-quality-witness arrest interactions.
- [ ] Player: opt-in via MDT (police) → confidential rep.
- [ ] Informants leak gang plans into police dispatch.

GTA-first: betrayal is the lifeblood of the criminal sandbox.

Files: `apps/event-worker/src/engines/police/informants.ts`, MDT updates.

---

## [M5] Syndicate hierarchy + business-front linkage

**Objective**: Gangs at scale promote to syndicate; linked businesses launder more efficiently.

Scope:
- [ ] Syndicate flag on Gang at reputation threshold.
- [ ] Business-gang link table; laundering rate boost when linked.
- [ ] Police investigations dig the link; severing it costs the syndicate cash.

Files: backend services + schema migration.
