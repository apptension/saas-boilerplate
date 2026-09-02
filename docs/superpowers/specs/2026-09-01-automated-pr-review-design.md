# Automated first-pass code review on pull requests

Issue: [apptension/saas-boilerplate#707](https://github.com/apptension/saas-boilerplate/issues/707)
Status: approved in planning discussion, 2026-09-01. Scope narrowed from the
issue's original AC1 — see [Deviation from the filed issue](#deviation-from-the-filed-issue).

## Context / Why

The repo has 420 forks. Most pull requests arrive from contributors a
maintainer has never worked with, and nothing looks at a diff before a human
does. Review is one person reading the whole change, so mechanical problems —
a missed migration, an unhandled error path, a convention the monorepo
already follows elsewhere — spend that reader's attention before any
judgment call gets it.

## Goal

Every pull request opened from a branch in this repo gets an automated
first-pass review before a human looks, posted as a PR comment, gated by one
stably-named check that branch protection can point at regardless of which
review provider is configured.

## Deviation from the filed issue

Issue #707's AC1, as filed, tests a PR opened **from a fork**. Building that
means running a credentialed model-provider job against untrusted,
unreviewed code from a first-time contributor — a residual risk (cost,
prompt-injection surface) distinct from the credential/write-scope risk
`pull_request_target` already closes. This spec narrows the first cut to
same-repo PRs and tracks fork PRs as a follow-up, proposed and reasoned in
[issue comment 2026-09-01](https://github.com/apptension/saas-boilerplate/issues/707#issuecomment-5494485224).
A fork PR still gets the `Automated Code Review` check (from variable
validation), just no review comment.

## Non-goals (out of scope for this issue)

- Review on PRs opened from forks. Native mitigation available today,
  independent of this workflow: repo Settings → Actions → General → "Fork
  pull request workflows" → require approval for outside collaborators /
  first-time contributors.
- A working `claude` review path. `AUTOMATED_REVIEWER` still validates to
  exactly `claude` or `codex`, but only `codex` has an analysis job wired.
  Selecting `claude` fails the aggregate check with a named error instead of
  silently doing nothing — never a silent skip, matching the variable's own
  fail-closed behavior on unset.
- A repo-authored review prompt beyond pointing the vendor action at
  `CLAUDE.md`. Move to one only once we can name what the bundled reviewer
  gets wrong here.
- Configuring branch protection to require the check. Recorded as a
  follow-up; this issue only makes the check name stable enough for that to
  be a one-line change later.
- Provisioning the `OPENAI_API_KEY` repo secret. Operational, done by a human
  with repo admin access — see [Left for a human](#left-for-a-human).

## Approaches considered

**A — Vendor GitHub Action + thin repo glue (recommended).**
`openai/codex-action@v1` (confirmed to exist on GitHub Marketplace,
[github.com/openai/codex-action](https://github.com/openai/codex-action))
does the sandboxed model call; a small amount of repo-authored YAML does
validation, permission splitting, artifact hand-off, and comment dedup.
Matches the issue's explicit instruction to start with the vendor-bundled
capability. Dependent on the action's exact input/output surface, which
[Codex GitHub Action safety notes](https://codex.danielvaughan.com/2026/04/08/codex-github-action/)
partially document — verify against the action's own README at
implementation time rather than trusting this spec's field names.

**B — Same as A, wrapped in a composite action under
`.github/workflows/actions/`.** Matches this repo's existing convention
(`deploy/`, `render-deploy/`, `setup/` are all composite actions there).
Rejected for now: nothing else calls this review step, so wrapping it is
abstraction with one caller. Revisit if a second workflow ever needs the
same step.

**C — No vendor action; call the OpenAI API directly.** Full control over
output shape, but reinvents credential handling, retries, and sandboxing the
vendor action already solves, and directly contradicts the issue's
instruction to start with the bundled capability. Rejected.

## Architecture

One new workflow, `.github/workflows/automated-code-review.yml`, triggered
on `pull_request_target` for `[opened, synchronize, reopened]` — never
`pull_request`, so a PR cannot rewrite the steps that hold write scope.

```
concurrency:
  group: automated-code-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

A new push cancels a still-running review of the superseded SHA instead of
letting two runs race to comment.

| Job | `needs` | `if` | `permissions` | Does |
|---|---|---|---|---|
| `validate-reviewer` | — | — | `{}` | Reads `vars.AUTOMATED_REVIEWER`. Empty or outside `{claude, codex}` → `::error::` naming the variable, fail. Outputs the validated value. |
| `codex-analysis` | `validate-reviewer` | provider is `codex`, and `head.repo.full_name == github.repository` (same-repo only, see [Deviation](#deviation-from-the-filed-issue)) | `contents: read` | Checks out `github.event.pull_request.head.sha` (pinned SHA, never a mutable ref). Runs `openai/codex-action` with `sandbox: read-only` (one of `workspace-write`/`read-only`/`danger-full-access`) and `safety-strategy: drop-sudo`. **Why `sandbox` and not `permission-profile`:** `permission-profile` does exist at the real `v1` tag — verified by reading that tag's own `action.yml` — and the vendor prefers it, labelling `sandbox` "Legacy sandbox mode" with a note to "prefer `permission-profile: \":workspace\"` for new workflows". But `actionlint`'s bundled action-metadata for `openai/codex-action` is stale and does not yet list `permission-profile`, so it rejects that input as undefined. `sandbox: read-only` is used specifically to keep this repo's `actionlint` gate passing on a false positive, **not** because `permission-profile` is unavailable. Both express the same read-only boundary. Revisit once `actionlint` refreshes its metadata for this action. a repo-authored prompt file pointing at `CLAUDE.md` (`.github/workflows/prompts/codex-review.md`), and `OPENAI_API_KEY` scoped to this job only. Writes findings to `output-file`; `actions/upload-artifact` publishes it. |
| `post-review` | `codex-analysis` | `codex-analysis` succeeded | `issues: write` + `pull-requests: write`, no provider credential | Downloads the artifact. Searches existing PR comments for the `github-actions[bot]` marker (see [Dedup](#dedup-on-repeat-pushes)); same SHA → no-op, older SHA → edit that comment in place, none found → create one via `actions/github-script` and the default `GITHUB_TOKEN` (this is what makes AC1's `github-actions[bot]` authorship automatic). PR comments post through the `issues` REST endpoint, not `pulls`, so `issues: write` is likely sufficient on its own — but GitHub's REST reference does not state which scope grants it for a pull request, and `openai/codex-action`'s own documented example workflow pairs `issues: write` with `pull-requests: write` for exactly this step. Since this workflow cannot be exercised before merge, both are declared, matching the vendor's pairing rather than guessing. Neither scope grants code write, so this does not widen the boundary the design protects. |
| `Automated Code Review` | all of the above | `always()` | `{}` | Stable aggregate name branch protection points at. Fails if `validate-reviewer` failed, or if the resolved provider has no analysis job wired (today: anything but `codex`), or if `codex-analysis`/`post-review` failed. Treats `skipped` (fork PR, or `claude` selected) as passing through, not failing, except the "provider has no job wired" case, which is an explicit fail. |

## Dedup on repeat pushes

The posted comment carries a hidden marker: `<!-- automated-code-review:sha=<HEAD_SHA> -->`.
`post-review` lists existing PR comments first. A marker for the same SHA
means this exact commit was already reviewed — skip, satisfying "a repeat
push that leaves the head SHA unchanged does not produce a second review
comment." A marker for an older SHA means the PR moved — edit that same
comment in place rather than posting a new one, so the PR thread carries one
review comment, not a growing chain.

## Security notes

- Credential isolation: `codex-analysis` never has `pull-requests: write`;
  `post-review` never sees `OPENAI_API_KEY`. Neither job can use the other's
  privilege even if the reviewed diff or the model output tries to make it.
- `sandbox: read-only` + `safety-strategy: drop-sudo` bound what
  the sandboxed Codex process can do to the filesystem regardless of what
  the untrusted diff contains.
- Prompt injection from the diff content is a residual risk `read-only`
  sandboxing does not remove — the model could describe the change
  misleadingly. The output is an advisory comment a human still reads before
  merging, not an auto-merge gate, which bounds the blast radius to "a
  misleading comment," not an executed action.
- `allow-users` / `allow-bots` inputs the action documents for its
  mention-driven mode likely do not apply to this event-driven, non-mention
  trigger — confirm against the action's README during implementation rather
  than configuring them from this spec's guess.

## Testing / verification

GitHub Actions YAML has no meaningful unit test, and `pull_request_target`
reads the workflow *definition* from the base branch, not the PR branch —
so the PR that introduces this file cannot trigger it. Verification is:

1. `actionlint` against the new workflow file.
2. The validation and dedup logic extracted as plain bash / JS and unit
   tested locally (no GitHub context needed for either).
3. After this merges to `master`: a real trial PR opened from a same-repo
   branch, checked against every acceptance criterion below by hand. This
   is the only reliable way to prove the checkout, the permission split,
   and the dedup behavior actually work — and it can only happen
   post-merge, so it is a follow-up, not a gate this PR's own CI can clear.

## Acceptance criteria (as amended)

- [ ] A pull request opened from a branch in this repo shows one check named
      `Automated Code Review` on the PR page, with its review comment
      authored by `github-actions[bot]`.
- [ ] A pull request opened from a fork shows the `Automated Code Review`
      check, with no review comment.
- [ ] `AUTOMATED_REVIEWER` set to `claude` or `codex` does not fail
      validation; unsetting it fails the workflow with an error naming the
      variable, instead of skipping review.
- [ ] Selecting `claude` (validated but unimplemented) fails the aggregate
      check with a named error, not a silent no-op.
- [ ] The job holding the model-provider credential has no
      `pull-requests: write` scope; the job that posts has no
      model-provider credential.
- [ ] `.github/workflows/` contains no second workflow that posts an
      automated review.
- [ ] A repeat push that leaves the head SHA unchanged does not produce a
      second review comment.

## Assumptions

- `openai/codex-action@v1` exists and is the intended vendor action
  ([github.com/openai/codex-action](https://github.com/openai/codex-action)) —
  confirmed via research during this planning session, but its exact input
  names and output format must be re-verified against its own README when
  implementing, not trusted from this spec or from the secondary source
  cited above.
- The repo secret will be named `OPENAI_API_KEY`; the prompt file will live
  at `.github/workflows/prompts/codex-review.md`. Neither name is fixed by
  the issue — pick differently at implementation time if a better
  convention turns up.
- No existing workflow in this repo triggers on `pull_request` or
  `pull_request_target`, defines explicit `permissions:`, or references a
  Claude/Codex GitHub Action (confirmed by grep during planning) — this
  issue introduces all three patterns to the repo for the first time.

## Left for a human

- Add the `OPENAI_API_KEY` repo secret (Settings → Secrets and variables →
  Actions). Not something an agent should do — it is a credential.
- Set `AUTOMATED_REVIEWER` = `codex` as a repo variable once the workflow
  merges.
- Decide whether to enable "require approval for outside collaborators" for
  fork PR workflows (native GitHub setting, independent of this issue).
- Configure branch protection to require the `Automated Code Review` check,
  whenever ready — the stable aggregate name makes this a one-line change.
- After merge to `master`: open one real trial PR from a same-repo branch
  and check it against every acceptance criterion by hand.
  `pull_request_target` cannot be exercised by the PR that introduces the
  workflow file, only by a later PR against the merged base branch.
