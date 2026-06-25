# Chapter 3 — Completion Review

## Delivered responsibility boundaries

```text
Presentation
  projects/presentation/project-workspace.*
  - renders the feature;
  - forwards user events;
  - requests the application service through Angular DI.

Application
  projects/application/project-workspace.service.ts
  - owns the workspace state lifetime;
  - coordinates filtering and selection workflows;
  - depends only on the repository port and state/domain functions.

Port
  projects/ports/project-repository.ts
  - defines what project data access must provide;
  - contains no Angular or infrastructure knowledge.

Infrastructure
  projects/infrastructure/local-project.repository.ts
  - implements the repository port using validated local seed data.

Composition
  projects/project.providers.ts
  app.config.ts
  - selects concrete implementations;
  - connects runtime tokens, adapters, and service factories.

Domain
  projects/domain/*
  - retains business vocabulary and invariants.
```

## Dependency inversion

The application service accepts `ProjectRepository`, not `LocalProjectRepository`.

```text
Before:
presentation -> local seed

After:
presentation -> application -> repository port <- local adapter
```

The inner application policy does not depend on the outer data mechanism. A future
`HttpProjectRepository` can implement the same port.

## Angular DI decisions

- `PROJECT_REPOSITORY` is an `InjectionToken<ProjectRepository>` because TypeScript interfaces are
  removed at runtime.
- `provideProjects()` registers `LocalProjectRepository` with `useClass` at the application
  environment injector.
- `PROJECT_WORKSPACE_PROVIDER` uses `useFactory` to construct the Angular-independent application
  service with the repository chosen by DI.
- `ProjectWorkspaceService` is provided on the feature component, giving each workspace component
  an isolated state instance and lifecycle.
- The presentation component uses `inject(ProjectWorkspaceService)` and never calls `new` for its
  collaborators.

## Replaceability proof

The presentation test provides a fake repository with `useValue`. The same component renders a
different project collection without importing or changing `LocalProjectRepository`.

```text
Production provider -> LocalProjectRepository -> three projects
Test provider       -> FakeProjectRepository  -> controlled test projects
```

## Test evidence

Twenty-seven tests across six suites verify:

- project domain invariants;
- workspace state derivation;
- application workflow coordination;
- local repository behavior;
- presentation interaction;
- root shell composition;
- repository substitution through Angular DI.

## Deliberate boundaries

- The repository is synchronous because no server request exists yet. RxJS and asynchronous request
  state will be introduced only when concurrency appears.
- Workspace state is still mutated directly inside the application service. Chapter 4 will replace
  scattered mutation with explicit immutable transitions.
- The local adapter uses seed data. Chapter 7 will add a server adapter and external data boundary.
- The feature is application-configured rather than route-scoped because routing has not yet become
  a product requirement.
