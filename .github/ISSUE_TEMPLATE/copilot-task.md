---
name: Copilot task
about: Sized for a single Copilot agent PR.
title: "[M?] "
labels: ["copilot-task"]
---

## Milestone
<!-- M0..M9 -->

## Objective
<!-- One paragraph. Outcome, not implementation. -->

## In scope
- [ ]
- [ ]

## Out of scope
-

## Files expected to change
- `path/to/file`

## Acceptance criteria
- [ ] Tests added
- [ ] Lint / typecheck / build green
- [ ] PR description fills `GTA-first justification` and (if AI used) AI cost block
- [ ] Reviewer from CODEOWNERS for any touched protected paths

## Constraints
- Must follow `AGENTS.md` rules.
- New events must extend `@gtarp/event-schema`.
- New AI calls must route through `@gtarp/ai-clients` and ai-orchestrator.
