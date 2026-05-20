# M0 — Foundation

Most M0 scaffolding shipped in the kickoff commit. Remaining work below.

---

## [M0] Verify lockfile + first install

**Objective**: Produce a committed `pnpm-lock.yaml` with all workspace packages installed cleanly.

In scope:
- [ ] Run `pnpm install` at repo root.
- [ ] Run `pnpm -F @gtarp/db prisma:generate`.
- [ ] Run `pnpm lint typecheck test build`.
- [ ] Commit `pnpm-lock.yaml`.

Acceptance: CI green on first PR.

Files: `pnpm-lock.yaml` (new).

---

## [M0] Husky install + lint-staged wire-up

**Objective**: Pre-commit hook runs `lint-staged` and blocks commits that fail lint.

Scope:
- [ ] Run `pnpm prepare`.
- [ ] Confirm `.husky/pre-commit` is executable and runs on a test commit.
- [ ] Document hook bypass policy in `AGENTS.md` (no `--no-verify` without explicit owner sign-off).

Files: `.husky/pre-commit`, `AGENTS.md`.

---

## [M0] Lua linting (luacheck) baseline

**Objective**: Add a `lua-ci.yml` workflow that runs `luacheck` on `apps/fivem-resources/**/*.lua`.

Scope:
- [ ] Add `.luacheckrc` at repo root with QBox + FiveM globals whitelisted.
- [ ] New GH workflow `.github/workflows/lua-ci.yml`.
- [ ] No actual resources exist yet — workflow passes with no Lua files.

Files: `.luacheckrc`, `.github/workflows/lua-ci.yml`.

---

## [M0] Vision site stub (apps/web)

**Objective**: Next.js 15 app scaffold with a single landing page. No content yet beyond placeholder hero + Discord invite slot.

Scope:
- [ ] Scaffold `apps/web` with Next 15, Tailwind, TS.
- [ ] Wire into `turbo.json` and root scripts.
- [ ] Static landing `/` page.
- [ ] CI builds the app.

Files: `apps/web/**`.

---

## [M0] Backend service stub (apps/backend)

**Objective**: Empty Fastify TS app that boots, exposes `/healthz`, and reads env from `.env`.

Scope:
- [ ] `apps/backend/src/server.ts` with Fastify boot.
- [ ] `/healthz` returns `{ status: 'ok', sha: <git>, time }`.
- [ ] Vitest unit test for the handler.

Files: `apps/backend/**`.

---

## [M0] Event-worker stub (apps/event-worker)

**Objective**: Worker process that connects to NATS + Redis, logs a heartbeat every 30s, and exposes `/healthz`.

Scope:
- [ ] NATS JetStream stream `gtarp` created on boot if absent.
- [ ] Graceful shutdown on SIGTERM.

Files: `apps/event-worker/**`.

---

## [M0] AI orchestrator stub (apps/ai-orchestrator)

**Objective**: Fastify service exposing `/generate/text` and `/generate/voice` that return 501 Not Implemented. Wires up `@gtarp/ai-clients` types.

Acceptance: Compiles, types compile, contract test for request schema passes.

Files: `apps/ai-orchestrator/**`.

---

## [M0] Discord bot stub (apps/discord-bot)

**Objective**: discord.js v14 client that logs in and ack's slash command `/ping`.

Files: `apps/discord-bot/**`.
