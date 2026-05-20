# Copilot AGENTS.md

Mirror of root [`AGENTS.md`](../../AGENTS.md). Copilot agents must read both. Conflict between this file and root file → root wins.

## Additional Copilot-specific rules

1. **Stay inside the issue.** If you discover unrelated work, file a new issue, do not bundle.
2. **Cite files with paths.** Every claim about existing code must reference the file path.
3. **Never invent SA terms or place names.** If `@gtarp/sa-content` lacks what you need, add an entry in the same PR with a citation in the PR description.
4. **Default to Tier 0 templates.** Promote to higher tiers only when prompted reasoning shows lower tier insufficient — capture that reasoning in the PR.
5. **Never amend `main`.** Open a PR. Always.
6. **No silent dependency adds.** Each new dep gets a one-line rationale in the PR description.
