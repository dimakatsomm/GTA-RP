# ADR-0001: FiveM framework — QBox

- Status: Accepted
- Date: 2026-05-19
- Deciders: Project owner

## Context

FiveM RP servers run on a base framework that provides player state, inventory, economy, jobs, vehicles, MDT, etc. Top options:

- **QBox** — modern fork of QBCore. Active maintenance, ox_lib + ox_inventory ecosystem, cleaner code, TypeScript-friendly tooling on the horizon.
- **QBCore** — largest community, most existing resources, but older patterns and slower upstream.
- **ESX** — legacy, declining momentum, mismatched with our event-driven backend goals.
- **Custom** — full control, but multiplies build cost in Phase 1 by an order of magnitude.

## Decision

Use **QBox** as the framework base.

## Consequences

Positive:
- ox_inventory + ox_lib reduce custom work for inventory, target, menu UIs.
- Active maintenance lowers security/maintenance load.
- QBCore-compatible resources port with minor adjustments.

Negative:
- Smaller install base than QBCore — fewer turnkey resources, more porting work.
- Newer framework, fewer Stack-Overflow-equivalents.

Mitigations:
- Constrain custom FiveM resources to thin clients; heavy logic lives in `apps/backend` + `apps/event-worker`.
- Vendor critical ox_* dependencies as Git submodules to pin versions.
