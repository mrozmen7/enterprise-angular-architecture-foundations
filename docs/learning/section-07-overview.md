# Chapter 7 — Server and Distributed State

## Company requirement

OpsFlow is no longer allowed to treat browser memory as the source of truth. Projects must come
through an HTTP API, remain usable during refreshes, update quickly, recover from failed writes, and
avoid silently overwriting a newer change made by another employee.

## Why this changes the architecture

Local state belongs to one running browser:

```text
browser memory
  -> one user
  -> one process
  -> immediate and predictable
```

Server state is distributed:

```text
browser A
browser B
mobile client
background process
      -> shared server record
```

The client therefore cannot assume that:

- cached data is still current;
- an HTTP request will succeed;
- the response matches the TypeScript type written in the client;
- the record has not changed since it was loaded;
- an optimistic UI change has already become server truth.

## Learning goals

- configure modern standalone Angular HTTP with `provideHttpClient`;
- keep `HttpClient` inside an infrastructure adapter;
- distinguish API DTOs from validated domain models;
- understand that an `HttpClient<T>` generic is a compile-time assertion, not runtime validation;
- model cache-first and network-only loading policies;
- keep previous data visible during a background refresh;
- implement optimistic update, server reconciliation, and rollback;
- use a numeric version for optimistic concurrency control;
- convert HTTP `409 Conflict` into an application-level conflict;
- test HTTP requests with `provideHttpClientTesting` and `HttpTestingController`.

## Dependency direction

```text
Presentation
  -> ProjectWorkspaceStore
      -> ProjectRepository port
          <- HttpProjectRepository adapter
              -> Angular HttpClient
                  -> /api/projects
```

The application and domain layers do not import `HttpClient`, HTTP status codes, or API response
shapes.

## Server-state lifecycle

```text
cache-first load
  -> fresh cache exists?
       yes -> return cache snapshot
       no  -> GET /api/projects
                -> validate DTOs
                -> update cache
                -> synchronize canonical state

manual refresh
  -> network-only
  -> bypass cache
  -> GET /api/projects
```

The current project list stays visible while a background refresh is running.

## Optimistic priority workflow

```text
user chooses priority
  -> capture previous Project and version
  -> update UI immediately
  -> PATCH priority + expectedVersion
       success
         -> accept server Project
         -> use incremented version
       ordinary failure
         -> restore previous Project
       409 conflict
         -> accept newer server Project
         -> explain that another user changed it
```

This is optimistic because the UI changes before the server confirms the write. It is safe because
the previous state and server version are preserved for rollback or conflict reconciliation.

## API contract boundary

The HTTP adapter requests `unknown` and maps the response explicitly:

```text
unknown JSON
  -> shape checks
  -> supported status and priority checks
  -> domain validation
  -> Project
```

Malformed server data fails at the infrastructure boundary instead of leaking invalid objects into
the store and template.

## Learning environment boundary

The repository includes a functional in-memory API interceptor so the standalone course application
can exercise the real Angular `HttpClient` pipeline without requiring a separately deployed backend.
In a company deployment, remove the mock interceptor and point the same HTTP repository at the real
API. The application, domain, port, and presentation layers do not change.
