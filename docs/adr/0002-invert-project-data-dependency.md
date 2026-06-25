# ADR 0002 — Invert the Project Data Dependency

## Status

Accepted

## Context

The project screen depended directly on local seed data and the root component coordinated both the
course shell and Project Workspace behavior. Replacing local data with an API would have required
changes in presentation code.

## Decision

- Extract Project Workspace into a feature presentation component.
- Move workflow coordination into an Angular-independent `ProjectWorkspaceService`.
- Define a `ProjectRepository` port owned by the application boundary.
- Implement the port with `LocalProjectRepository`.
- Use an Angular `InjectionToken` to represent the interface at runtime.
- Select the local adapter in `app.config.ts`.
- Scope `ProjectWorkspaceService` to the feature component through a factory provider.

## Alternatives considered

### Inject `LocalProjectRepository` directly

This is simpler but makes the application workflow depend on one data mechanism. Tests and future
HTTP migration would know the concrete class.

### Mark every service as `providedIn: 'root'`

This reduces provider configuration, but it would make feature-specific workspace state a
global-lifetime singleton and hide where infrastructure is selected.

### Add NgRx or another state library

The problem is dependency direction and responsibility ownership, not state-library capability.
Adding a library would not replace the need for these boundaries.

### Use asynchronous Observables immediately

The current repository is synchronous. Introducing RxJS before a real asynchronous requirement
would add concepts without solving present engineering pressure.

## Consequences

- Presentation no longer knows the concrete data source.
- Application behavior can be tested with a plain fake repository.
- Feature component tests can replace infrastructure through DI.
- Provider configuration is more explicit and requires understanding injector scope.
- A future HTTP adapter can implement the same port, although the port will evolve when
  asynchronous server behavior becomes real.
