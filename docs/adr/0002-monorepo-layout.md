# ADR-0002: Monorepo layout (pnpm + Turbo)

- Status: Accepted
- Date: 2026-05-19

## Context

We have ~6 TypeScript services, ~5 shared packages, FiveM resources in Lua, infra-as-code, and a web app. Choices:

- Monorepo (pnpm workspaces + Turbo) — shared types/contracts/lint config trivially shared.
- Multi-repo — service isolation, harder cross-cutting changes.
- Hybrid — TS monorepo + Lua sibling repo.

## Decision

Single pnpm + Turbo monorepo. Lua resources live under `apps/fivem-resources/`, treated as a non-TS app in the workspace.

## Consequences

Positive:
- Atomic changes across event schema, backend, and consumers in one PR.
- Turbo caches typecheck/test/build for fast CI.
- One linter/formatter/CI config.

Negative:
- CI complexity (Postgres + Redis + NATS in service containers).
- Lua tooling differs from TS — separate lint/test job in CI.

Mitigations:
- Per-package `package.json` keeps boundaries clear.
- CODEOWNERS enforces architecture team approval on schema and AI packages.
