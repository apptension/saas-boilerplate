# Automated PR Review (Codex) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.github/workflows/automated-code-review.yml` so every pull request opened from a branch in this repo gets an automated Codex review comment before a human looks, gated by one stably-named `Automated Code Review` check.

**Architecture:** One `pull_request_target` workflow, four jobs. `validate-reviewer` fails closed on a bad/missing `AUTOMATED_REVIEWER` variable. `codex-analysis` (same-repo PRs only, `contents: read` only) checks out the PR head, computes its diff, and runs `openai/codex-action` in a read-only sandbox against a repo-authored prompt, uploading findings as an artifact. `post-review` (`issues: write` only, no provider credential) downloads that artifact and creates or in-place-edits one PR comment, deduped by a hidden per-SHA marker. `Automated Code Review` aggregates all three under one stable name for branch protection to point at later.

**Tech Stack:** GitHub Actions YAML, `openai/codex-action@v1`, `actions/github-script@v7`, plain Node.js (no test framework — this repo's Nx projects don't cover `.github/`, so verification here is `actionlint` plus small `node:assert`-based scripts).

**Spec:** [docs/superpowers/specs/2026-09-01-automated-pr-review-design.md](../specs/2026-09-01-automated-pr-review-design.md)

## Global Constraints

- Trigger is `pull_request_target` on `[opened, synchronize, reopened]`, never `pull_request` — the issue's own reasoning: a `pull_request` trigger would let a PR rewrite the steps that hold write scope.
- `concurrency: group: automated-code-review-${{ github.event.pull_request.number }}, cancel-in-progress: true` on the workflow, so a new push cancels a still-running review of the superseded SHA.
- The job holding `secrets.OPENAI_API_KEY` (`codex-analysis`) never has `pull-requests: write` or `issues: write`. The job that posts (`post-review`) never sees `secrets.OPENAI_API_KEY`. (Spec AC, verbatim from issue #707 AC3.)
- Every job declares an explicit `permissions:` block, even when it is `{}` — this repo has no existing workflow that sets `permissions:` at all, so there is no convention to match; default to the narrowest scope each job needs.
- `codex-analysis` and `post-review` use `if: always() && needs.<job>.result == 'success' && ...` rather than a bare boolean — GitHub Actions' default skip-propagation behavior when a needed job is itself skipped (not failed) is easy to get backwards from memory; `always()` plus an explicit `.result == 'success'` check sidesteps relying on it.
- Existing repo convention: `actions/checkout@v3` (used in `backend.yml`, `docs.yml`, `workers.yml`) — match it here rather than introducing `@v4` for one new workflow. `actions/upload-artifact` / `download-artifact` / `github-script` have no existing pin in this repo to match, so use current stable major versions (`@v4`, `@v4`, `@v7`).
- `permission-profile` on `openai/codex-action` takes a **named profile string with a leading colon** — `:read-only`, not `read-only` — confirmed against the action's own `action.yml` during planning. Getting the colon wrong is a silent no-op, not an error, so this is worth double-checking at Task 3.
- Commit after each task with a Conventional Commits message; they compose into one `feat(ci): ...` scoped change by the time the PR opens, matching this repo's commit convention.

---

### Task 1: Workflow skeleton, trigger, and reviewer validation

**Files:**
- Create: `.github/workflows/automated-code-review.yml`

**Interfaces:**
- Produces: job `validate-reviewer`, output `provider` (the validated `AUTOMATED_REVIEWER` value, `'claude'` or `'codex'`). Tasks 2 and 6 read `needs.validate-reviewer.outputs.provider` and `needs.validate-reviewer.result`.

- [ ] **Step 1: Write the validation logic and prove its exit codes locally, before it lives in YAML**

Run this in a shell exactly as shown — it is the same logic Step 3 embeds in the workflow, so proving it here proves the shipped version:

```bash
validate() {
  local AUTOMATED_REVIEWER="$1"
  if [ -z "$AUTOMATED_REVIEWER" ]; then
    echo "::error::AUTOMATED_REVIEWER repository variable is not set. Set it to 'claude' or 'codex' in Settings > Secrets and variables > Actions > Variables."
    return 1
  fi
  if [ "$AUTOMATED_REVIEWER" != "claude" ] && [ "$AUTOMATED_REVIEWER" != "codex" ]; then
    echo "::error::AUTOMATED_REVIEWER is set to '$AUTOMATED_REVIEWER', which is not supported. Use 'claude' or 'codex'."
    return 1
  fi
  echo "provider=$AUTOMATED_REVIEWER"
  return 0
}

validate ""; echo "empty -> exit $?"
validate "bogus"; echo "bogus -> exit $?"
validate "codex"; echo "codex -> exit $?"
validate "claude"; echo "claude -> exit $?"
```

Expected: `empty -> exit 1`, `bogus -> exit 1`, `codex -> exit 0` (prints `provider=codex`), `claude -> exit 0` (prints `provider=claude`).

- [ ] **Step 2: Run it and confirm the four exit codes above**

- [ ] **Step 3: Write the workflow file with the trigger, concurrency, and `validate-reviewer` job**

```yaml
name: Automated code review

on:
  pull_request_target:
    types: [opened, synchronize, reopened]

concurrency:
  group: automated-code-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  validate-reviewer:
    name: Validate reviewer selection
    runs-on: ubuntu-24.04
    permissions: {}
    outputs:
      provider: ${{ steps.validate.outputs.provider }}
    steps:
      - name: Validate AUTOMATED_REVIEWER
        id: validate
        env:
          AUTOMATED_REVIEWER: ${{ vars.AUTOMATED_REVIEWER }}
        run: |
          if [ -z "$AUTOMATED_REVIEWER" ]; then
            echo "::error::AUTOMATED_REVIEWER repository variable is not set. Set it to 'claude' or 'codex' in Settings > Secrets and variables > Actions > Variables."
            exit 1
          fi
          if [ "$AUTOMATED_REVIEWER" != "claude" ] && [ "$AUTOMATED_REVIEWER" != "codex" ]; then
            echo "::error::AUTOMATED_REVIEWER is set to '$AUTOMATED_REVIEWER', which is not supported. Use 'claude' or 'codex'."
            exit 1
          fi
          echo "provider=$AUTOMATED_REVIEWER" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/automated-code-review.yml
git commit -m "feat(ci): validate AUTOMATED_REVIEWER before running automated review"
```

---

### Task 2: Codex analysis job

**Files:**
- Modify: `.github/workflows/automated-code-review.yml`

**Interfaces:**
- Consumes: `needs.validate-reviewer.outputs.provider`, `needs.validate-reviewer.result` (Task 1).
- Produces: job `codex-analysis`, uploads artifact `codex-review-output` containing `codex-review-output.md`. Task 5 downloads this artifact; Task 6 reads `needs.codex-analysis.result`.

- [ ] **Step 1: Append the `codex-analysis` job**

```yaml
  codex-analysis:
    name: Codex analysis
    needs: validate-reviewer
    if: >-
      always() &&
      needs.validate-reviewer.result == 'success' &&
      needs.validate-reviewer.outputs.provider == 'codex' &&
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-24.04
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.sha }}
          fetch-depth: 0

      - name: Compute PR diff
        run: |
          git diff "${{ github.event.pull_request.base.sha }}"..."${{ github.event.pull_request.head.sha }}" > pr.diff
          echo "Diff size: $(wc -l < pr.diff) lines"

      - name: Run Codex review
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          prompt-file: .github/workflows/prompts/codex-review.md
          output-file: codex-review-output.md
          permission-profile: ":read-only"
          safety-strategy: drop-sudo

      - uses: actions/upload-artifact@v4
        with:
          name: codex-review-output
          path: codex-review-output.md
          retention-days: 1
```

The same-repo condition (`head.repo.full_name == github.repository`) is why this job never runs for a fork PR — see the spec's [Deviation from the filed issue](../specs/2026-09-01-automated-pr-review-design.md#deviation-from-the-filed-issue). `fetch-depth: 0` pulls full history so `git diff` against the PR's base SHA works; a shallow checkout would leave the base commit unreachable locally.

**Not independently testable here**: this job needs a real `OPENAI_API_KEY` secret and a real pull-request event context to execute — GitHub Actions has no local runner for `pull_request_target` semantics. Task 7's `actionlint` pass is this task's verification; end-to-end behavior is verified by the post-merge trial PR (see Task 8).

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/automated-code-review.yml
git commit -m "feat(ci): add codex analysis job for same-repo PRs"
```

---

### Task 3: Review prompt

**Files:**
- Create: `.github/workflows/prompts/codex-review.md`

**Interfaces:**
- Consumes: nothing (static file).
- Produces: the file Task 2's `prompt-file` input points at.

- [ ] **Step 1: Write the prompt**

```markdown
# Automated first-pass code review

You are reviewing a pull request against this repository's own conventions,
recorded in `CLAUDE.md` at the repository root. Read `CLAUDE.md` before
forming an opinion.

The full diff for this pull request is in `pr.diff` at the repository root.
Read it. The working tree also holds the complete repository at the PR's
head commit, so you can open any file the diff touches for full context.

Focus on:

- Correctness: logic errors, unhandled error paths, edge cases the diff's
  own tests do not cover.
- Consistency: whether the change follows a convention this monorepo
  already uses elsewhere (naming, error handling, test structure, the
  patterns `CLAUDE.md` documents) instead of introducing a new one.
- Missed housekeeping: a schema or model change with no accompanying
  migration, a public interface change with no updated caller, a new
  dependency with no clear justification.

Do not comment on formatting or style a linter already enforces. Do not
restate what the diff does — say what is wrong, where, and why, or say
plainly that nothing stood out.

Write your findings as markdown: a one-line verdict first ("Found N issues"
or "Nothing blocking found"), then one bullet per issue naming the file,
the line, and the concern. Keep the whole thing under 500 words.
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/prompts/codex-review.md
git commit -m "feat(ci): add codex review prompt"
```

---

### Task 4: Comment dedup logic, with a real unit test

**Files:**
- Create: `.github/workflows/scripts/dedupe-review-comment.js`
- Test: `.github/workflows/scripts/dedupe-review-comment.test.js`

**Interfaces:**
- Produces: `buildMarker(headSha)`, `decideCommentAction(comments, headSha)` — exported functions. Task 5's `post-review` job `require`s this module.
  - `buildMarker(headSha: string) -> string` — the hidden marker embedded in the comment body.
  - `decideCommentAction(comments: Array<{id: number, body: string, user: {type: string}}>, headSha: string) -> {action: 'create'} | {action: 'skip'} | {action: 'update', commentId: number}`

- [ ] **Step 1: Write the failing test**

```javascript
// .github/workflows/scripts/dedupe-review-comment.test.js
const assert = require('node:assert/strict');
const { decideCommentAction, buildMarker } = require('./dedupe-review-comment');

function botComment(id, body) {
  return { id, body, user: { type: 'Bot' } };
}

// No existing bot comment -> create a new one
assert.deepEqual(decideCommentAction([], 'sha-a'), { action: 'create' });

// Existing bot comment for the same head SHA -> skip (this is the
// "repeat push, unchanged SHA" acceptance criterion)
const sameSha = [botComment(1, buildMarker('sha-a') + '\nfindings')];
assert.deepEqual(decideCommentAction(sameSha, 'sha-a'), { action: 'skip' });

// Existing bot comment for an older SHA -> edit it in place
const olderSha = [botComment(2, buildMarker('sha-old') + '\nfindings')];
assert.deepEqual(decideCommentAction(olderSha, 'sha-new'), {
  action: 'update',
  commentId: 2,
});

// A human comment that happens to start with the marker text must never
// be mistaken for the bot's own comment
const humanComment = [{ id: 3, body: buildMarker('sha-a'), user: { type: 'User' } }];
assert.deepEqual(decideCommentAction(humanComment, 'sha-a'), { action: 'create' });

console.log('dedupe-review-comment.test.js: all assertions passed');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node .github/workflows/scripts/dedupe-review-comment.test.js`
Expected: `Error: Cannot find module './dedupe-review-comment'`

- [ ] **Step 3: Write the implementation**

```javascript
// .github/workflows/scripts/dedupe-review-comment.js
const MARKER_PREFIX = '<!-- automated-code-review:sha=';
const MARKER_SUFFIX = ' -->';

function buildMarker(headSha) {
  return `${MARKER_PREFIX}${headSha}${MARKER_SUFFIX}`;
}

function decideCommentAction(comments, headSha) {
  const existing = comments.find(
    (c) => c.user && c.user.type === 'Bot' && c.body.startsWith(MARKER_PREFIX)
  );
  if (!existing) {
    return { action: 'create' };
  }
  const existingSha = existing.body.slice(
    MARKER_PREFIX.length,
    existing.body.indexOf(MARKER_SUFFIX)
  );
  if (existingSha === headSha) {
    return { action: 'skip' };
  }
  return { action: 'update', commentId: existing.id };
}

module.exports = { buildMarker, decideCommentAction, MARKER_PREFIX, MARKER_SUFFIX };
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `node .github/workflows/scripts/dedupe-review-comment.test.js`
Expected: `dedupe-review-comment.test.js: all assertions passed`, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/scripts/dedupe-review-comment.js .github/workflows/scripts/dedupe-review-comment.test.js
git commit -m "feat(ci): add review comment dedup logic with unit test"
```

---

### Task 5: Post-review job

**Files:**
- Modify: `.github/workflows/automated-code-review.yml`

**Interfaces:**
- Consumes: `needs.codex-analysis.result` (Task 2), artifact `codex-review-output` (Task 2), `buildMarker`/`decideCommentAction` from `.github/workflows/scripts/dedupe-review-comment.js` (Task 4).
- Produces: job `post-review`. Task 6 reads `needs.post-review.result`.

- [ ] **Step 1: Append the `post-review` job**

```yaml
  post-review:
    name: Post review comment
    needs: codex-analysis
    if: always() && needs.codex-analysis.result == 'success'
    runs-on: ubuntu-24.04
    permissions:
      issues: write
    steps:
      - uses: actions/checkout@v3

      - uses: actions/download-artifact@v4
        with:
          name: codex-review-output
          path: codex-review-output

      - name: Post or update review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const path = require('path');
            const { buildMarker, decideCommentAction } = require(
              path.join(process.env.GITHUB_WORKSPACE, '.github/workflows/scripts/dedupe-review-comment.js')
            );

            const headSha = context.payload.pull_request.head.sha;
            const findings = fs.readFileSync('codex-review-output/codex-review-output.md', 'utf8');
            const body = `${buildMarker(headSha)}\n## Automated code review (codex)\n\n${findings}`;

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              per_page: 100,
            });

            const decision = decideCommentAction(comments, headSha);

            if (decision.action === 'skip') {
              core.info(`Comment already posted for ${headSha}, skipping.`);
            } else if (decision.action === 'update') {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: decision.commentId,
                body,
              });
              core.info(`Updated review comment for ${headSha}.`);
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                body,
              });
              core.info(`Created review comment for ${headSha}.`);
            }
```

Comments post through the `issues` REST endpoint (`listComments`/`createComment`/`updateComment` are all `issues.*` in Octokit even for a pull request), which is why this job's permission is `issues: write`, not `pull-requests: write` — confirmed against `openai/codex-action`'s own example workflow during planning, which pairs the two for exactly this reason. The checkout here has no `ref:` override, so it defaults to the base branch under `pull_request_target` — safe, because this job only reads its own trusted repo's script file, never the PR's code.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/automated-code-review.yml
git commit -m "feat(ci): post codex review findings as a deduped PR comment"
```

---

### Task 6: Aggregate check

**Files:**
- Modify: `.github/workflows/automated-code-review.yml`

**Interfaces:**
- Consumes: `needs.validate-reviewer.result`, `needs.validate-reviewer.outputs.provider`, `needs.codex-analysis.result`, `needs.post-review.result` (Tasks 1, 2, 5).
- Produces: job `Automated Code Review` — the name branch protection will require once configured (see spec's [Left for a human](../specs/2026-09-01-automated-pr-review-design.md#left-for-a-human)).

- [ ] **Step 1: Reason through the four outcomes this job must distinguish, before writing it**

| `AUTOMATED_REVIEWER` | Same-repo PR? | `codex-analysis` | `post-review` | Aggregate result |
|---|---|---|---|---|
| unset / bogus | — | skipped (validate-reviewer failed) | skipped | **fail** — validation error |
| `codex` | yes | success | success | **pass** |
| `codex` | no (fork) | skipped (same-repo condition false) | skipped (analysis not success) | **pass**, no comment posted |
| `claude` | either | skipped (provider != codex) | skipped | **fail** — named "not wired yet" error |

- [ ] **Step 2: Append the aggregate job**

```yaml
  automated-code-review:
    name: Automated Code Review
    needs: [validate-reviewer, codex-analysis, post-review]
    if: always()
    runs-on: ubuntu-24.04
    permissions: {}
    steps:
      - name: Check results
        env:
          VALIDATE_RESULT: ${{ needs.validate-reviewer.result }}
          PROVIDER: ${{ needs.validate-reviewer.outputs.provider }}
          ANALYSIS_RESULT: ${{ needs.codex-analysis.result }}
          POST_RESULT: ${{ needs.post-review.result }}
        run: |
          if [ "$VALIDATE_RESULT" != "success" ]; then
            echo "::error::AUTOMATED_REVIEWER validation failed. See the validate-reviewer job for details."
            exit 1
          fi

          if [ "$PROVIDER" != "codex" ]; then
            echo "::error::AUTOMATED_REVIEWER is set to '$PROVIDER', which has no review job wired yet. Only 'codex' is implemented."
            exit 1
          fi

          if [ "$ANALYSIS_RESULT" != "success" ] && [ "$ANALYSIS_RESULT" != "skipped" ]; then
            echo "::error::Codex analysis job failed."
            exit 1
          fi

          if [ "$POST_RESULT" != "success" ] && [ "$POST_RESULT" != "skipped" ]; then
            echo "::error::Posting the review comment failed."
            exit 1
          fi

          echo "Automated code review passed."
```

This step-level `run:` block is the same four-branch truth table from Step 1 — walk each row of that table against the script by hand before moving on, rather than trusting it by inspection alone.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/automated-code-review.yml
git commit -m "feat(ci): add stable Automated Code Review aggregate check"
```

---

### Task 7: Lint the whole workflow

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Install actionlint**

```bash
brew install actionlint
```

- [ ] **Step 2: Run it against the new workflow**

```bash
actionlint .github/workflows/automated-code-review.yml
```

Expected: no output, exit code 0. Fix anything it flags — a bad `if:` expression, an undefined `needs` reference, a YAML syntax error — before moving on; do not silence a real finding by narrowing what actionlint checks.

- [ ] **Step 3: Re-run the Task 4 unit test as a final sanity check**

```bash
node .github/workflows/scripts/dedupe-review-comment.test.js
```

Expected: `dedupe-review-comment.test.js: all assertions passed`.

No commit — this task only verifies work already committed in Tasks 1–6.

---

### Task 8: Push and open the draft PR

**Files:**
- Modify: none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin HEAD
```

- [ ] **Step 2: Write the PR body**

This repo's own template (`.github/pull_request_template.md`) has no dedicated section for design decision, verification, or left-undone, so those are appended as their own sections after the template's — per `dev-flow`'s rule that a field with no home in the template gets appended under its own heading, never stacked as a second copy of a section the template already has. Fill in the two `<...>` spots with Task 7's actual captured output before saving — every other line is final as written:

```markdown
### Please check if the PR fulfills these requirements

- [x] The commit message follows our guidelines
- [x] Tests for the changes have been added (for bug fixes/features)
- [ ] Docs have been added / updated (for bug fixes / features)

### What kind of change does this PR introduce?

Feature — a new CI workflow.

### What is the current behavior?

No pull request gets an automated review before a human looks at it.
Closes #707.

### What is the new behavior?

Every pull request opened from a branch in this repo gets a Codex review
comment before a human looks, gated by one stably-named `Automated Code
Review` check that branch protection can require later regardless of which
provider is configured.

### Does this PR introduce a breaking change?

No — a new workflow file, additive.

### Other information:

**Design decision.** Design track — brainstorming then a written spec, per
`apptension-sdlc:dev-flow`'s design gate (this issue requires a new CI
workflow, which fails the direct-track criteria outright). Full design:
[docs/superpowers/specs/2026-09-01-automated-pr-review-design.md](../superpowers/specs/2026-09-01-automated-pr-review-design.md).
Scope narrowed from the issue's original AC1 during planning — see the
spec's [Deviation from the filed issue](../superpowers/specs/2026-09-01-automated-pr-review-design.md#deviation-from-the-filed-issue)
and [issue comment](https://github.com/apptension/saas-boilerplate/issues/707#issuecomment-5494485224).

**Verification.**
- `actionlint .github/workflows/automated-code-review.yml` → `<paste Task 7 Step 2's actual output here>`
- `node .github/workflows/scripts/dedupe-review-comment.test.js` → `<paste Task 7 Step 3's actual output here>`
- End-to-end (checkout, permission split, dedup) verified by a trial PR — not possible before merge, since `pull_request_target` reads the workflow definition from the base branch. Tracked as a follow-up.

**Left undone.**
- Review on PRs opened from forks (deliberately out of scope, see the spec).
- A working `claude` review path — `codex` only for this first cut.
- Provisioning the `OPENAI_API_KEY` repo secret and setting the
  `AUTOMATED_REVIEWER` repo variable — needs a human with repo admin access.
- Enabling "require approval for outside collaborators" for fork PR
  workflows, and configuring branch protection to require this check —
  both native GitHub settings, independent of this PR's code.
- The post-merge trial-PR verification above.
```

- [ ] **Step 3: Open the draft PR**

```bash
gh pr create --draft --base master \
  --title "feat(ci): automated codex review on pull requests" \
  --body-file <path to the file containing the body from Step 2>
```

- [ ] **Step 4: No further commit in this task** — pushing and opening the PR are not code changes.

---

## After this plan

Not part of any task above, because none of it is something an agent should do unattended (see the spec's [Left for a human](../specs/2026-09-01-automated-pr-review-design.md#left-for-a-human)):

- A human adds the `OPENAI_API_KEY` repo secret and sets the `AUTOMATED_REVIEWER` repo variable to `codex`.
- A human decides whether to enable "require approval for outside collaborators" for fork PR workflows.
- After merge to `master`, a human (or a following session) opens one real trial PR from a same-repo branch and checks it against every acceptance criterion in the spec by hand — `pull_request_target` cannot be exercised by the PR that introduces the workflow file itself.
- A human configures branch protection to require the `Automated Code Review` check, whenever ready.
