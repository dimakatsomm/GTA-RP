# Copilot Issue Bodies

Each `m<N>-*.md` is a ready-to-paste GitHub issue body for a Copilot agent. One file = one PR.

## Conventions

- Title format: `[M<N>] <verb-led summary>`
- Labels: `copilot-task`, `milestone-<N>`
- Branch: `m<N>/<slug>`
- Every issue body includes: objective, scope, files, acceptance criteria, constraints.

## Bulk create

```bash
for f in docs/copilot-issues/m*.md; do
  title=$(head -n1 "$f" | sed 's/^# //')
  gh issue create --title "$title" --body-file "$f" \
    --label copilot-task \
    --label "milestone-$(basename "$f" | cut -c2)"
done
```

## Order

Issues within a milestone are mostly independent unless `Depends on` says otherwise. Milestones themselves are sequential.

## Sizing rule

If an issue feels >1 PR, split it. Agents land focused PRs.
