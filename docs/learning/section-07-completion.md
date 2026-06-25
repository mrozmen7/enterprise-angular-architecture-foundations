# Chapter 7 — Completion Review

## Delivered architecture

```text
ProjectWorkspace template
  -> ProjectWorkspaceStore
      -> ProjectRepository
          -> HttpProjectRepository
              -> HttpClient
                  -> mock course API / real company API
```

The old synchronous local repository has been removed from the active architecture. Project
collection loading, search, priority persistence, risk summaries, and activity summaries now cross
an HTTP boundary.

## Source of truth

```text
server record
  -> API DTO
  -> validated Project
  -> canonical workspace Signal state
  -> computed views
  -> template
```

The template never treats an API DTO, cache entry, or optimistic value as a separate permanent
source of truth.

## Cache policy

`HttpProjectRepository` owns a small thirty-second in-memory cache:

| Request intent           | Policy         | Behavior                                            |
| ------------------------ | -------------- | --------------------------------------------------- |
| Initial feature load     | `cache-first`  | use a fresh cache, otherwise request the server     |
| Explicit user refresh    | `network-only` | bypass cache and request the server                 |
| Successful priority save | cache update   | replace the saved project inside the existing cache |

The cache returns a snapshot containing projects, source, and fetch time. This makes freshness
decisions observable instead of hiding them inside a boolean.

## Optimistic update and rollback

```text
canonical Project v1 / High
  -> user selects Low
  -> optimistic UI: v1 / Low
  -> PATCH expectedVersion=1

success:
  server returns v2 / Low
  -> canonical state becomes v2 / Low

network or server failure:
  -> canonical state returns to v1 / High
```

Queued writes still use `concatMap`. Each queued operation reads the current canonical version only
when that operation begins, so later writes do not reuse a version made stale by an earlier save.

## Concurrent-user conflict

```text
client loaded       server current
Project v1          Project v2

client PATCH expectedVersion=1
server compares versions
  -> mismatch
  -> HTTP 409 + current Project v2
client maps response to ProjectConflictError
store accepts server Project v2
UI explains the conflict
```

The client never silently overwrites the newer server record. This is optimistic concurrency
control, not a database lock.

## DTO and domain separation

`HttpClient` generic types do not validate JSON at runtime. The adapter therefore requests `unknown`
and maps it through explicit contract checks before calling the Project domain factory.

```text
ProjectDto
  - transport strings and nested JSON
  - owned by infrastructure

Project
  - supported status and priority
  - valid dates and version
  - owned by the domain
```

## HTTP testing

Infrastructure tests use Angular's HTTP testing backend:

```text
repository method
  -> captured HTTP request
  -> assert method, URL, params, and body
  -> flush controlled response
  -> assert mapped domain result
```

The tests make no real network requests.

## Test evidence

Fifty-five tests across eight suites verify:

- previous domain, reducer, Signal, RxJS, DI, and presentation behavior;
- positive integer project versions;
- API DTO runtime validation;
- initial HTTP collection loading;
- cache-first reuse and network-only refresh;
- HTTP search parameters;
- priority PATCH body and expected version;
- successful cache reconciliation;
- conversion of HTTP 409 into `ProjectConflictError`;
- optimistic UI updates;
- rollback after ordinary failures;
- reconciliation with newer server truth after conflicts;
- background refresh without blanking current data.

The production build and a browser-level walkthrough also verify:

- three server-synchronized projects render;
- the selected priority matches canonical state;
- a successful save changes priority and increments `v1` to `v2`;
- explicit server refresh completes;
- no browser console error is produced.

## Deliberate boundaries

- The functional mock interceptor is a course backend substitute, not a production server.
- Authentication, authorization, retry policy, offline persistence, and service-worker caching are
  product-specific concerns and are not added without a requirement.
- A thirty-second in-memory cache demonstrates freshness policy; a larger product may adopt a
  dedicated server-state library only when its coordination pressure justifies that dependency.
- Conflict resolution currently chooses server truth. A future product requirement could provide a
  field-level comparison or a user-driven merge screen.
