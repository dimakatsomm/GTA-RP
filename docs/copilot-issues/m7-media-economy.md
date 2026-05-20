# M7 — AI Media & Economy

Depends on: M6.

---

## [M7] Radio station worker

**Objective**: Hourly news bulletin worker generates audio bulletin from event patterns.

Scope:
- [ ] Aggregator picks 3 top events from last hour (severity × reach).
- [ ] Tier 2 script generation; Tier 0 templates wrap intro/outro.
- [ ] ElevenLabs hero voice for anchor.
- [ ] Persisted as `RadioBroadcast`. Streamed in-game via `[media]/radio`.

GTA-first: the city *talks about you* — that's reputation made audible.

Files: `apps/event-worker/src/engines/media/radio.ts`, `apps/fivem-resources/[media]/radio/**`.

---

## [M7] Newspaper / news site

**Objective**: News articles generated from event patterns; served at `/news` in web app.

Scope:
- [ ] Categories: crime, politics, business, gossip.
- [ ] Tier 2 generation with heavy prompt caching of style + lore.
- [ ] Each article cites the underlying `EventLog` ids (admin-only debug field).

Files: `apps/event-worker/src/engines/media/news.ts`, `apps/web/src/news/**`.

---

## [M7] Podcast generator

**Objective**: Weekly long-form podcast recap. Tier 3 (one-shot, budgeted).

Scope:
- [ ] Aggregates week of major arcs.
- [ ] Two-voice format (host + guest). ElevenLabs.
- [ ] Length cap: 8 minutes. Published to web app + Discord.

Files: `apps/event-worker/src/engines/media/podcast.ts`.

---

## [M7] Economy engine: supply/demand

**Objective**: Black-market goods (drugs, weapons, counterfeit) prices flex per area + recent crime activity.

Scope:
- [ ] Per-area demand curves.
- [ ] Police pressure dampens demand; gang victories spike supply.
- [ ] Prices exposed via backend; FiveM resources query at sale time.

Files: `apps/event-worker/src/engines/economy/blackmarket.ts`.

---

## [M7] Economy engine: insurance + property value

**Objective**: Insurance premiums and property values respond to area crime stats.

Scope:
- [ ] Insurance: vehicle and property; daily recalculated.
- [ ] Property: monthly market value drift; sales reflect current value.

Files: `apps/event-worker/src/engines/economy/insurance.ts`, `.../property.ts`.

---

## [M7] Crime → economy feedback loop

**Objective**: Sustained CIT robberies in a province → insurance hike → business outrage → political pressure → news cycle.

Scope:
- [ ] Cross-engine subscription: economy emits `economy.insurance_hike` → media engine picks it up.
- [ ] Event-bus subjects extended in `@gtarp/event-schema`.

GTA-first: closes the loop *chaos → consequence*. Players feel the city react.

Files: schema updates, multiple engines.
