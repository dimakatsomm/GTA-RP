# M3 — MVP Vertical Slice

Goal: 10 share-worthy TikTok clips from internal playtest before unlocking M4.

Depends on: M2.

---

## [M3] QBox server bootstrap (apps/fivem-resources)

**Objective**: Self-contained QBox server-data folder that boots locally.

Scope:
- [ ] `apps/fivem-resources/server.cfg` (gitignored sensitive values, template committed).
- [ ] Pinned QBox + ox_lib + ox_inventory versions via submodules or pinned releases.
- [ ] `pnpm fivem:dev` script starts the txAdmin container.
- [ ] README in `apps/fivem-resources/`.

Files: `apps/fivem-resources/**`.

---

## [M3] `[ai]/ai_dispatch` resource

**Objective**: Lua resource that listens for `dispatch.requested` server events (via backend WebSocket bridge) and renders NUI dispatch panel + plays audio.

Scope:
- [ ] Server-side: connect to backend WS, subscribe to dispatch events for own server.
- [ ] Client-side NUI: incident card with severity color, area, summary.
- [ ] Audio: prefetch the synthesized voice URL from event payload, stream in-game.
- [ ] `/dispatch` toggle for police job to mute non-police chatter.

GTA-first: Living radio chatter is the single highest-clip-yield surface.

Files: `apps/fivem-resources/[ai]/ai_dispatch/**`.

---

## [M3] Dispatch engine worker

**Objective**: Event-worker consumer subscribed to `crime.committed`. Generates incident summary (Tier 0 template; Tier 1 fallback for novel severities), synthesizes voice line via ai-orchestrator, publishes `dispatch.requested`.

Scope:
- [ ] Suspect description built from crime + witness data when available.
- [ ] Severity → voice tone selection (calm for petty, urgent for serious+).
- [ ] Idempotent: same `crimeId` produces same incident summary on retry.

Files: `apps/event-worker/src/engines/dispatch/**`.

---

## [M3] `[ai]/ai_witness` resource

**Objective**: Client-side scan for nearby NPC peds at crime events. Server-side rolls witness quality based on factors and writes `witness.observed` event.

Scope:
- [ ] Factors: lighting (time of day + indoors), distance, fear (gun present), intimidation (gang ped nearby), intoxication (random for civilians at bars).
- [ ] Quality formula in `apps/event-worker/src/engines/witness/quality.ts` — unit tested.
- [ ] Witness ref persisted; players can later "tamper" witnesses (M4 hook).

Files: `apps/fivem-resources/[ai]/ai_witness/**`, `apps/event-worker/src/engines/witness/quality.ts`.

---

## [M3] Witness statement generation pipeline

**Objective**: When `witness.observed` event hits, generate a statement using Tier 2 model, persist as `WitnessReport`.

Scope:
- [ ] Prompt template includes: factors, quality, SA-content register hint, lore-bible tone guard.
- [ ] Cache key includes quality bucket + crime type + suspect description hash.
- [ ] Statement length capped (200 words).

Files: `apps/event-worker/src/engines/witness/**`.

---

## [M3] `[crime]/hijack` + `[crime]/robbery` resources

**Objective**: Two crime resources that emit `crime.committed` correctly.

Scope:
- [ ] Hijack: pulling driver from vehicle at gunpoint.
- [ ] Robbery: holdup at till in convenience store.
- [ ] Both publish properly typed events via backend `/events`.
- [ ] Local manual test plan documented.

Files: `apps/fivem-resources/[crime]/hijack/**`, `apps/fivem-resources/[crime]/robbery/**`.

---

## [M3] `[police]/mdt` minimal

**Objective**: In-game tablet UI for police job. Search by name → returns CriminalRecord + recent Crimes + open Warrants.

Scope:
- [ ] NUI built with simple HTML/CSS (no React, keep small).
- [ ] Backend endpoint `/police/mdt/search` with role check.
- [ ] No editing yet (read-only in MVP).

Files: `apps/fivem-resources/[police]/mdt/**`, `apps/backend/src/routes/police.ts`.

---

## [M3] Discord bot — incident feed + queue + mod cmds

**Objective**: Bot mirrors `dispatch.requested` to an incident channel, runs queue commands, and exposes mod tools (kick/ban via backend).

Scope:
- [ ] Slash: `/queue position`, `/queue clear` (mod).
- [ ] Incident embeds: severity color, area, summary, link to clip-share scaffold.
- [ ] Mod cmds gated on Discord role.

Files: `apps/discord-bot/**`.

---

## [M3] Vision site v1 (apps/web)

**Objective**: Landing page, devlog index, Discord invite, mailing-list capture.

Scope:
- [ ] Hero, principles (5 of them), Phase 1 roadmap with milestone progress bar pulled from a JSON file.
- [ ] `/devlog` index listing MDX entries.
- [ ] First MDX entry committed.

Files: `apps/web/**`.

---

## **Ship gate**

Closed-beta playtest produces ≥10 TikTok-shareable clips. Until that happens, M4 issues are not opened.
