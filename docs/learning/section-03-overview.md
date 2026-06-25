# Chapter 3 — Separation of Concerns and Dependency Injection

## Company requirement

OpsFlow must be able to replace local project data with test data and, later, an HTTP API without
rewriting the project screen or business workflow.

## Engineering pressure

At the end of Chapter 2, the root component still:

- rendered the course shell and the entire project feature;
- created workspace state from a concrete local seed;
- coordinated search, filtering, and selection;
- knew where project data came from.

This coupling made a future API migration a presentation change.

## Learning goals

- separate presentation, application, domain, ports, and infrastructure responsibilities;
- understand dependencies as required collaborators;
- apply dependency inversion through a repository port;
- understand why TypeScript interfaces require an Angular `InjectionToken`;
- configure `useClass`, `useFactory`, and dependency lists;
- understand application and component injector scopes;
- replace infrastructure with a test double without changing feature code;
- identify the composition root where concrete implementations are selected.

## Target architecture

```text
App shell
  -> ProjectWorkspace presentation component
      -> ProjectWorkspaceService
          -> ProjectRepository port
              <- LocalProjectRepository adapter
                  -> validated Project seed

ProjectWorkspaceService
  -> ProjectWorkspaceState
      -> Project domain
```

The arrow from the application service points to an abstraction. Infrastructure implements that
abstraction and is connected at application startup.

## Dependency Injection flow

```text
app.config.ts
  provides:
    PROJECT_REPOSITORY -> LocalProjectRepository

ProjectWorkspace component injector
  provides:
    ProjectWorkspaceService factory
      asks for PROJECT_REPOSITORY

Angular injector
  searches:
    component injector
      -> parent environment injector
        -> finds LocalProjectRepository
```

The component asks for `ProjectWorkspaceService`; it does not construct the service or repository.
