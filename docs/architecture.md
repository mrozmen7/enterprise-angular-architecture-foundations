# Reference Architecture

## Purpose

OpsFlow demonstrates how a small Angular feature can evolve into a maintainable enterprise
architecture without introducing patterns before a requirement justifies them.

## System context

```text
Employee
  -> Angular application
      -> Project API
          -> shared project records
```

The repository includes a functional HTTP interceptor as a deployable course API substitute. A real
backend can replace it without changing the presentation, application, domain, or port layers.

## Feature architecture

```text
Presentation
  ProjectWorkspace component and template
        |
        v
Application
  ProjectWorkspaceStore
  commands + reducer + request state
        |
        v
Port
  ProjectRepository
        ^
        |
Infrastructure
  HttpProjectRepository
  DTO mapper + API boundary
        |
        v
Angular HttpClient
```

## Dependency rule

Dependencies point toward stable business meaning:

```text
presentation -> application -> domain
                         \-> ports <- infrastructure
```

- Domain imports only domain concepts.
- Application can use domain concepts and ports, but not infrastructure.
- Presentation can invoke application workflows, but not HTTP adapters.
- Infrastructure implements ports and translates transport data into validated domain objects.
- Composition roots are the only locations that connect abstractions to implementations.

`npm run architecture:check` verifies these rules in CI.

## State ownership

```text
Repository server snapshot
  -> canonical ProjectWorkspaceState
      -> readonly Signal
          -> computed filtered projects
          -> computed selected project
          -> computed request status
              -> OnPush template
```

The store privately owns the writable Signal. Consumers receive readonly source and derived Signals.
Reducers perform immutable synchronous transitions. RxJS owns time and concurrency policies.

## Asynchronous policies

| Workflow          | Policy         | Operator     |
| ----------------- | -------------- | ------------ |
| Project search    | latest wins    | `switchMap`  |
| Priority saves    | preserve order | `concatMap`  |
| Briefing creation | ignore repeat  | `exhaustMap` |
| Briefing parts    | join parallel  | `forkJoin`   |

Failures are converted into request state inside each inner workflow so future user events remain
active.

## Server-state policy

- Initial collection loading is cache-first.
- Explicit refresh is network-only.
- Cached data has a thirty-second freshness window.
- Priority changes update the UI optimistically.
- Ordinary failures restore the captured previous Project.
- Every Project carries a version.
- HTTP 409 conflicts restore the newer validated server Project.

## Runtime boundaries

API data enters the application as `unknown`:

```text
unknown JSON
  -> DTO shape validation
  -> supported vocabulary validation
  -> domain factory validation
  -> Project
```

TypeScript types alone are never treated as runtime validation.

## Composition roots

- `app.config.ts` configures global Angular providers and the course API interceptor.
- `project.providers.ts` maps `ProjectRepository` to `HttpProjectRepository` and creates the
  feature-scoped Store.
- `ProjectWorkspace` owns the lifetime of its Store.

## Deliberate non-goals

This foundation does not claim that every Angular system needs:

- a global state library;
- micro-frontends;
- SSR or hydration;
- offline persistence;
- a monorepo;
- zoneless execution.

Those tools belong in an advanced architecture only when product and organizational pressure
justify their cost.
