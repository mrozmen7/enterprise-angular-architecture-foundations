# ADR 0005 — Encode Concurrency Policies with RxJS

## Status

Accepted

## Context

Project Workspace gained asynchronous search, queued priority saves, and a parallel project
briefing. Signals represented current values but did not express cancellation, ordering, duplicate
suppression, parallel completion, or recoverable stream errors.

## Decision

- Convert search state to an Observable with `toObservable`.
- Use `debounceTime`, `distinctUntilChanged`, and `switchMap` for latest-only search.
- Use a hot Subject and `concatMap` for ordered priority saves.
- Use a hot Subject, `exhaustMap`, and `forkJoin` for duplicate-safe parallel briefing work.
- Convert workflow Observables back to readonly Signals with `toSignal`.
- Catch errors inside flattening operators and publish discriminated request state.
- Keep canonical Project entities in reducer state and use search results only to determine matching
  identities.
- Avoid manual subscriptions while `toSignal` can own lifecycle cleanup.

## Alternatives considered

### Use Promises for every operation

Promises can model one completion but do not provide composition operators for cancellation,
queuing, duplicate suppression, or reusable event streams.

### Use one flattening operator everywhere

Each business rule has different concurrency semantics. Applying `switchMap` to saves could cancel a
required write; applying `concatMap` to search could show stale results.

### Use `mergeMap` for priority saves

Parallel saves could complete out of order and apply older intent after newer intent.

### Store subscriptions manually

Manual subscriptions require explicit lifecycle cleanup and make latest request state harder to
expose consistently. `toSignal` provides Angular lifecycle ownership.

### Put async behavior in the reducer

Reducers must remain deterministic and synchronous. Repository work belongs outside the transition
core.

## Consequences

- Concurrency behavior is explicit in operator choice.
- Stale search work is cancelled by unsubscription.
- Save order is deterministic.
- Duplicate briefing work is suppressed.
- Errors become recoverable UI state and do not terminate future intent streams.
- Store construction requires an Angular injector for RxJS interop cleanup.
- The repository port now exposes Observable operations and will map naturally to HTTP in Chapter 7.
