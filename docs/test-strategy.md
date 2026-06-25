# Risk-Based Test Strategy

## Principle

The project does not target a test count or coverage percentage in isolation. Tests are selected
according to the business or architectural risk created by a change.

## Test layers

| Layer                 | Primary risk                                  | Evidence                                     |
| --------------------- | --------------------------------------------- | -------------------------------------------- |
| Domain tests          | invalid business data enters the system       | validation and vocabulary tests              |
| Reducer tests         | state transitions mutate or lose information  | immutable transition and identity tests      |
| Store tests           | reactive timing corrupts current state        | controlled Subjects and virtual timers       |
| HTTP adapter tests    | client/server contracts drift                 | request and response tests with HTTP testing |
| Presentation tests    | users cannot observe or trigger workflows     | rendered DOM and interaction tests           |
| Shell tests           | application composition fails                 | configured application integration tests     |
| Architecture checks   | dependencies erode while behavior stays green | automated import and subscription rules      |
| Deployment smoke test | build works locally but not from its live URL | GitHub Pages HTTP and browser verification   |

## Deterministic async testing

Concurrency tests use controlled Subjects and fake timers rather than real network delays:

```text
test emits user intent
  -> assert subscription order
  -> emit controlled repository result
  -> assert canonical state
```

This proves cancellation, queuing, duplicate prevention, rollback, and conflict reconciliation
without timing-dependent tests.

## HTTP tests

`HttpTestingController` captures requests before a response is flushed:

```text
repository call
  -> assert method, URL, query, and body
  -> flush valid or invalid server response
  -> assert domain result or mapped error
```

No infrastructure test requires an external service.

## Architecture fitness function

`scripts/verify-architecture.mjs` fails when:

- an inner layer imports a forbidden outer layer;
- Angular HTTP escapes the infrastructure boundary;
- production feature code creates an undocumented manual subscription;
- a committed test contains `.only` or `.skip`.

The script is intentionally small and repository-specific. It captures current architectural
decisions without pretending to be a universal Angular rule set.

## Pull request quality gate

```text
format
  -> architecture boundaries
  -> 56 behavior tests
  -> production build
```

A successful test suite cannot compensate for a failed architecture or build check.
