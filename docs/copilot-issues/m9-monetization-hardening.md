# M9 — Monetization & Hardening

Depends on: M8.

---

## [M9] Stripe VIP subscription

**Objective**: Monthly subscription via Stripe Checkout. Entitlements sync to game.

Scope:
- [ ] Web checkout flow tied to Discord OAuth identity.
- [ ] Webhook handler updates `Player.vipTier`.
- [ ] In-game entitlements: queue priority, cosmetic skins, modest inventory cap.
- [ ] Cancellation handled gracefully (no entitlement loss mid-session; reverts at next login).

Forbidden by ADR-0005: gameplay-advantage items.

Files: `apps/web/src/billing/**`, `apps/backend/src/services/billing/**`, schema migration adding `vipTier`.

---

## [M9] Founder packages

**Objective**: One-time SKUs (custom plate, closed-beta access).

Scope:
- [ ] Inventory list capped (custom plates limit, beta slot cap).
- [ ] Sold via same Stripe flow.

Files: same as VIP.

---

## [M9] Anti-cheat baseline

**Objective**: FiveM-side basic protections + server validation.

Scope:
- [ ] Server-authoritative inventory mutations (no client-trusted writes).
- [ ] Speedhack / teleport detection on server.
- [ ] Suspicious event rate-limits in `/events`.
- [ ] Logging to dedicated `cheat-suspicion` channel in Discord.

Files: `apps/backend/src/security/**`, `apps/fivem-resources/[core]/anticheat/**`.

---

## [M9] Backup / restore runbook + DR test

**Objective**: Documented recovery procedure + a successfully executed dry-run.

Scope:
- [ ] Postgres + Redis + NATS JetStream backup strategy.
- [ ] Restore procedure in `docs/runbooks/disaster-recovery.md`.
- [ ] DR drill log committed.

Files: `docs/runbooks/disaster-recovery.md`.

---

## [M9] k8s + AKS staging

**Objective**: Helm charts for backend, ai-orchestrator, event-worker, discord-bot. Deploy to AKS staging cluster.

Scope:
- [ ] Charts in `infra/k8s/charts/`.
- [ ] Terraform module provisions AKS + Azure Postgres + Azure Cache for Redis.
- [ ] GitHub Action deploys to staging on `main` push.
- [ ] Production deploy is manual approval gated.

Files: `infra/k8s/**`, `infra/terraform/**`, new workflow.
