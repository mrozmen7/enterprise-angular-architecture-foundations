# CI/CD Learning Guide

## Why CI exists in this repository

Local checks prove that the project works on one developer machine. Continuous Integration repeats
the same checks on a clean GitHub-hosted runner so every pushed change has independent evidence.

The CI workflow runs:

```text
GitHub event
  -> create a fresh Ubuntu runner
  -> check out the repository
  -> install Node.js from .nvmrc
  -> install the locked dependencies with npm ci
  -> check formatting
  -> verify architecture boundaries
  -> run tests
  -> build the production bundle
  -> report success or failure
```

## Workflow location

GitHub Actions reads workflow definitions from:

```text
.github/workflows/ci.yml
```

## Triggers

The workflow runs when:

- a commit is pushed to `main`;
- a pull request targets `main`;
- a developer starts it manually with `workflow_dispatch`.

## Core terms

- **Workflow:** the complete automated process defined by one YAML file.
- **Event:** the repository activity that starts a workflow.
- **Job:** a group of steps running on the same runner.
- **Runner:** the temporary machine that executes a job.
- **Step:** one action or shell command inside a job.
- **Action:** a reusable automation unit, such as repository checkout or Node.js setup.

## Reliability decisions

- The Node.js version comes from `.nvmrc`, keeping local development and CI aligned.
- `npm ci` installs exactly from `package-lock.json` and fails if the lockfile is inconsistent.
- The workflow receives read-only repository content permission.
- A ten-minute timeout prevents a stuck job from running indefinitely.
- Concurrency cancels an outdated run when a newer commit for the same branch starts.
- Deployment credentials are not stored in the repository.

## CI versus CD

CI protects code quality:

```text
change -> format -> architecture -> test -> build -> verified commit
```

CD publishes the static reference application:

```text
verified main -> Pages build artifact -> github-pages environment -> public HTTPS URL
```

The deployment workflow is located at `.github/workflows/deploy-pages.yml`. It uses the permissions
required by GitHub Pages, uploads one immutable artifact, and deploys it through the explicit
`github-pages` environment.
