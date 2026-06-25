# Chapter 6 — Completion Review

## Delivered asynchronous workflows

### Search: latest request wins

```text
searchTerm Signal
  -> toObservable
  -> debounceTime(300)
  -> distinctUntilChanged()
  -> switchMap(repository.search)
  -> catchError to recoverable RequestState
  -> toSignal
```

`switchMap` unsubscribes from the previous search when a newer query arrives. A stale result cannot
replace the latest view.

### Priority saves: preserve order

```text
priority save Subject
  -> concatMap(repository.savePriority)
  -> success dispatches project-priority-changed command
  -> reducer updates canonical state
```

`concatMap` waits for one save to complete before subscribing to the next save.

### Delivery briefing: ignore duplicate starts and join parallel work

```text
briefing Subject
  -> exhaustMap(
       forkJoin(
         loadRiskSummary,
         loadActivitySummary
       )
     )
  -> briefing RequestState Signal
```

`exhaustMap` ignores new briefing requests while one is active. `forkJoin` starts both independent
operations and emits after both complete.

## Concurrency decision table

| Business rule                                  | Operator               | Reason                                                    |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| Wait for typing to settle                      | `debounceTime`         | avoids work for every keystroke                           |
| Ignore the same consecutive query              | `distinctUntilChanged` | avoids duplicate searches                                 |
| Only the newest search result is relevant      | `switchMap`            | unsubscribes from stale search work                       |
| Priority changes must be saved in order        | `concatMap`            | queues saves and preserves sequence                       |
| Ignore repeated briefing starts while running  | `exhaustMap`           | prevents duplicate workflow execution                     |
| Wait for independent risk and activity results | `forkJoin`             | emits once after every source completes                   |
| Continue after an operation failure            | inner `catchError`     | converts failure to data without killing the outer stream |

`mergeMap` is deliberately not used for saves because parallel completion could reorder changes.

## Request state

Every async workflow publishes a discriminated request state:

```text
idle
loading
success + data
error + safe previous data + message
```

Search errors preserve the last successful result. A failed search does not blank the workspace,
and later search requests still work.

## Signal and Observable responsibilities

```text
Signal
  - current search text;
  - current canonical project state;
  - current request state;
  - current derived UI values.

Observable
  - search terms over time;
  - queued save requests;
  - repeated briefing requests;
  - repository completions and failures.
```

`toObservable` converts the search Signal into a stream. `toSignal` subscribes once to each workflow
and exposes its latest request state to Angular.

## Stream temperature

- Repository methods return cold Observables: work begins for each subscription.
- Priority and briefing Subjects are hot intent streams: user events are emitted whether they came
  from the template or a test.
- Signals retain a current value; Subjects do not provide state snapshots.

## Error placement

`catchError` is placed inside each flattening operator:

```text
outer user-intent stream
  -> flattening operator
      -> repository operation
          -> catchError
```

This keeps the outer search, save, or briefing workflow subscribed after one operation fails.

## Subscription lifecycle

The store does not call `subscribe()` manually. `toSignal` owns the subscriptions and uses the
component injector passed by the provider factory, so subscriptions are cleaned up with the feature
lifecycle.

If a future integration requires manual subscription, `takeUntilDestroyed` is the default Angular
lifecycle boundary.

## Canonical project identity

Search results determine matching identities, but rendered project objects come from canonical
workspace state. This prevents a saved priority from being hidden by an older Project object stored
inside a search result.

```text
search result IDs
  + canonical state.projects
  -> current filteredProjects
```

## Test evidence

Forty-two tests across seven suites verify:

- search debounce and duplicate suppression;
- stale search cancellation;
- recoverable search errors;
- sequential save subscription order;
- queue survival after a failed save;
- duplicate briefing prevention;
- parallel briefing completion;
- Signal/Observable UI integration;
- canonical state updates after async saves;
- all earlier domain, reducer, Signal, DI, repository, and presentation behavior.

Tests use controlled Subjects and virtual timers. They do not wait for real network delays.

## Deliberate boundaries

- The adapter simulates latency locally; real HTTP and distributed server state belong to Chapter 7.
- Priority success updates local canonical state only after the simulated save succeeds. Optimistic
  updates and rollback are deferred to Chapter 7.
- `forkJoin` is correct because both briefing sources complete. It would not emit if one source were
  infinite.
- The feature has no manual subscription, so adding `takeUntilDestroyed` would be ceremonial rather
  than useful.
