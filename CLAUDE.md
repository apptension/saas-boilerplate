### Dev flow bindings

Concrete values for this repo, in one place so every contributor — human
or agent — reads the same ones. Rows are matched by label, so update a
row's value when the thing it names changes, rather than its label.

| Binding | Value |
|---|---|
| Default branch | `master` |
| Branching model | GitHub flow — feature branches off `master`, pull requests based on `master` |
| Code host | GitHub |
| CI provider | GitHub Actions (a legacy `bitbucket-pipelines.yml` is still in the tree) |
| Issue tracker | GitHub Issues |
| Stack | Nx monorepo, pnpm 10.26.2, Node 22; React 19.2.3 (`packages/webapp`); Django 5.2 on Python >=3.11.1, uv-managed (`packages/backend`); Celery on Python 3.11 (`packages/workers`); AWS CDK (`packages/infra`) |
| Verification | Per project via Nx: `pnpm nx run <project>:lint`, `:test`, `:build`, `:type-check` — e.g. `pnpm nx run webapp:lint`, `pnpm nx run backend:test`. Install with `pnpm install --include-workspace-root --frozen-lockfile --filter=<project>...` |
| Automated reviewer | `unknown` |
| Commit convention | Conventional Commits |
| Specs and plans | `unknown` |
| Board | **SaaS Boilerplate**, org `apptension`, project #2 (private) |
