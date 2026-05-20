# M6 — Family & Legacy

Depends on: M5.

Design constraint: this is NOT ERP. Focus is **status + influence + permanence**.

---

## [M6] Household + Family + Relationship gameplay

**Objective**: Players can form households at properties, found families with a surname, and track relationships.

Scope:
- [ ] In-game phone app `Mzansi Family`.
- [ ] Marriage = mutual consent + ceremony NPC at chosen venue.
- [ ] Household requires a Property; family can own multiple households.
- [ ] Relationship statuses: dating, married, divorced, estranged, parent_of.

Files: `apps/fivem-resources/[family]/**`, backend services.

---

## [M6] Child entity & dynasty progression

**Objective**: Children are persistent entities tied to a family. Aging is simulated (calendar-driven, not real time).

Scope:
- [ ] Birth = consensual phone-app action by both parents.
- [ ] Age increments via daily worker tick; configurable rate.
- [ ] At age threshold, child can be claimed as a new playable identity (alt slot) by a player on the same account.

GTA-first: dynasties are the *permanence* axis — your reputation outlives the character.

Files: `apps/event-worker/src/engines/family/aging.ts`, backend.

---

## [M6] Inheritance

**Objective**: On player death (permadeath option) or retirement, assets transfer per declared inheritance plan.

Scope:
- [ ] Will declared via phone app; can include businesses, properties, vehicles, cash, family role.
- [ ] If no will: split equally among `parent_of` relations alive.
- [ ] Reputation: a portion transfers to family score.

Files: `apps/backend/src/services/inheritance/**`.

---

## [M6] Public scandal generator

**Objective**: Consumes betrayal/affair/arrest events involving high-reputation families and generates scandal news arcs.

Scope:
- [ ] Pattern detector + Tier 2 generation.
- [ ] Scandal becomes a news article + gossip rumor.
- [ ] Affected family reputation drops; depending on actor, individual reputation can spike (anti-hero loop).

Files: `apps/event-worker/src/engines/media/scandal.ts`.

---

## [M6] Custody + maintenance court mini-system

**Objective**: Estranged parents can be sued for maintenance. Custody disputes resolve via in-game court NPC or judge player.

Scope:
- [ ] Court calendar; cases queue and resolve.
- [ ] Bribery hook: bailiff can be paid to misfile.
- [ ] Outcomes write to event log → reputation deltas.

Files: `apps/backend/src/services/court/**`.
