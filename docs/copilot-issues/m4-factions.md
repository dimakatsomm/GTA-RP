# M4 — Factions Deepening

Depends on: M3 ship gate passed.

---

## [M4] Crime progression tiers + perks

**Objective**: Reputation thresholds drive progression: hustler → crew → lieutenant → syndicate → kingpin. Each tier unlocks perks.

Scope:
- [ ] Threshold config table.
- [ ] Perks: contact-rolodex unlocks (fence, fixer, dirty cop), heat-decay rate, weapon access whitelist.
- [ ] No purchasable rank — all earned.

GTA-first: This is the *power* axis. Reputation must mean tangible city influence.

Files: `apps/event-worker/src/engines/reputation/progression.ts`, `apps/backend/src/routes/progression.ts`.

---

## [M4] Drug trade resource

**Objective**: Sourcing → packaging → selling loop with heat mechanics.

Scope:
- [ ] Three drug types with distinct supply chains.
- [ ] Selling at price modified by area demand (queries economy engine; falls back to flat price).
- [ ] Each sale emits `crime.committed` with type `drug_deal`.

Files: `apps/fivem-resources/[crime]/drugs/**`.

---

## [M4] CIT robbery resource

**Objective**: Cash-in-transit van hijack. Multi-player coordination, time-limited.

Scope:
- [ ] Schedule windows (van routes spawn dynamically based on time of day).
- [ ] Severity scaling by cash taken.
- [ ] Police get advance dispatch hint at higher gang reputation (heat).

Files: `apps/fivem-resources/[crime]/cit/**`.

---

## [M4] Counterfeit goods + tender fraud

**Objective**: Two business-front crime loops.

Scope:
- [ ] Counterfeit: produce → distribute → sell, with raid risk based on operation size.
- [ ] Tender fraud: government contract bidding minigame; bribes increase win chance, IA scrutiny accumulates.

Files: `apps/fivem-resources/[crime]/counterfeit/**`, `apps/fivem-resources/[crime]/tender_fraud/**`.

---

## [M4] Police: evidence chain-of-custody

**Objective**: Evidence rows track custody officer, contamination, storage location. Defense lawyers (Phase 2) will contest broken chains.

Scope:
- [ ] State machine: collected → in-transit → stored → in-court → archived.
- [ ] Each transition writes `EvidenceCustody` log row.
- [ ] MDT shows chain.

Files: `apps/backend/src/services/evidence/**`, MDT updates.

---

## [M4] Police: warrants + IA

**Objective**: Warrants issued from evidence threshold. Internal Affairs investigations triggered by IA-relevant events.

Scope:
- [ ] Warrant issuance rules in `apps/event-worker/src/engines/police/warrants.ts`.
- [ ] IA cases auto-opened on `bribe.accepted` involving officer subject + 2+ corroborating events.

Files: `apps/event-worker/src/engines/police/**`.

---

## [M4] Police: corruption temptation events

**Objective**: AI-seeded events offer officers bribes; choices feed into IA score and player reputation.

Scope:
- [ ] Periodic worker generates temptation events based on officer beat + recent crime patterns.
- [ ] Tier 1 generation for offer text; Tier 0 templates for routine offers.
- [ ] Player choice persisted to event log.

Files: `apps/event-worker/src/engines/police/temptation.ts`.

---

## [M4] Investigations: AI case summarization

**Objective**: MDT endpoint that summarizes a case (crime + evidence + witnesses) using Tier 2.

Scope:
- [ ] Heavy prompt caching of static lore + case prefix.
- [ ] Hard cap one summary per case per 10 min.

Files: `apps/ai-orchestrator/src/purposes/case-summary.ts`, MDT updates.

---

## [M4] Investigations: AI suspect profiling

**Objective**: Generate suspect profile from witness statements + criminal record + arrests. Tier 2 with cache.

Files: `apps/ai-orchestrator/src/purposes/suspect-profile.ts`.

---

## [M4] Business: hiring, payroll, bribes, protection

**Objective**: Business ownership gameplay.

Scope:
- [ ] Hire NPC or player workers; weekly payroll deducts from business account.
- [ ] Protection rackets: gangs can charge businesses; refusal raises raid risk.
- [ ] Bribes to officials reduce inspection severity.

Files: `apps/fivem-resources/[business]/**`, backend services.

---

## [M4] Business front laundering loop

**Objective**: Convert criminal cash to clean via business deposits.

Scope:
- [ ] Configurable laundering rate per business kind.
- [ ] Excessive laundering triggers IRS/SARS analogue audit (NPC event).
- [ ] Audit can be bribed away — bribe logged.

GTA-first: closes the loop between *crime* and *money*.

Files: `apps/backend/src/services/laundering/**`.
