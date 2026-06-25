# ADR 0007 — Enforce and Publish the Reference Architecture

## Status

Accepted

## Context

The repository is becoming a public reference. Behavior tests do not detect every architectural
regression, local builds do not prove repository-path deployment, and undocumented release steps
are difficult for other contributors to reproduce.

## Decision

- Add a repository-specific architecture fitness script.
- Run formatting, architecture checks, tests, and production compilation in CI.
- Deploy only a verified GitHub Pages build produced by GitHub Actions.
- Use the `github-pages` environment and the permissions required by the official Pages actions.
- Verify the deployed URL with HTTP and browser smoke checks.
- Publish architecture, testing, production-readiness, and contribution documentation.
- Tag Chapter 8 and publish a final GitHub release.

## Alternatives considered

### Rely on code review

Review is essential but inconsistent for mechanical dependency rules. Automation provides immediate,
repeatable feedback.

### Deploy from a developer machine

This can work but does not provide a reproducible clean-runner build or a protected deployment
record.

### Introduce a large lint or architecture platform

The project has a small, explicit rule set. A focused script has lower maintenance cost and makes
the decisions visible to beginners.

### Publish source code without a live application

Source remains valuable, but a public smoke-tested application gives reviewers direct evidence that
the final artifact runs.

## Consequences

- Architectural drift can fail before merge.
- Deployment is reproducible and auditable.
- GitHub Pages constrains the demo to a static frontend, so the course API remains an in-memory
  interceptor.
- The repository must keep its documentation, workflow action versions, base path, and live URL
  current.
