# Chapter 5 — Completion Review

## Reactive state ownership

`ProjectWorkspaceStore` owns one private writable signal:

```text
private stateSource: WritableSignal<ProjectWorkspaceState>
```

Consumers receive:

```text
readonly state: Signal<ProjectWorkspaceState>
```

The readonly signal reflects source updates but does not expose `set` or `update`. Runtime state
objects remain frozen because readonly signals do not prevent deep mutation of contained objects.

## Derived signals

The store exposes these computed values:

| Signal             | Derivation                                                   |
| ------------------ | ------------------------------------------------------------ |
| `searchTerm`       | current source state's search text                           |
| `statusFilter`     | current source state's status filter                         |
| `filteredProjects` | pure filtering function applied to current state             |
| `selectedProject`  | project derived from collection and selected identity        |
| `projectCount`     | length of the filtered project collection                    |
| `hasActiveFilters` | whether search text or a non-default status filter is active |

Computed signals are readonly, lazily evaluated, memoized, and invalidated when a tracked producer
changes.

## Write path

```text
UI method
  -> store workflow method
      -> typed command
          -> reducer
              -> stateSource.update
```

The component cannot bypass commands or write state directly.

## Read path

```text
Angular template reactive context
  -> reads filteredProjects()
  -> Angular records the dependency
  -> source state changes
  -> computed cache is invalidated
  -> OnPush component is marked for a future update
  -> template reads the recalculated value
```

## Equality and reference strategy

Angular signals use `Object.is` by default. No deep equality function is configured.

This fits the reducer contract:

- no-op command -> reducer returns the same state reference -> signal does not notify consumers;
- real transition -> reducer returns a new state reference -> dependent computations are
  invalidated.

Deep equality would duplicate reducer responsibility and add collection traversal cost.

## Why no effect exists

The feature currently has no required non-reactive side effect. Filtering, selection, count, and
filter status are derivations, so they use `computed`.

An `effect` would be justified later for an external boundary such as:

- writing a preference to browser storage;
- sending analytics;
- integrating a non-reactive logging API;
- synchronizing with an imperative visualization library.

Effects are not used to copy one signal into another or propagate application state.

## `untracked`

No `untracked` call is required. It would be used inside a reactive context only when reading a
signal incidentally without making it a dependency, such as including a diagnostic counter in a log
that should rerun only when the user identity changes.

## Test evidence

Forty tests across seven suites verify:

- readonly source signal exposure;
- computed signals are not writable;
- lazy computed evaluation;
- memoized repeated reads;
- invalidation after real state changes;
- no invalidation after reducer no-op transitions;
- reactive filtering, count, selection, and active-filter state;
- immutable priority updates through a signal;
- presentation updates after signal changes;
- all earlier domain, reducer, DI, repository, and UI behavior.

## Deliberate boundaries

- The store is Angular-specific; domain, commands, reducer, state functions, and repository port
  remain framework independent.
- All signals are synchronous. Async streams, cancellation, ordering, and recoverable errors belong
  to Chapter 6.
- No `linkedSignal` is required because the selected project is readonly derived state, not writable
  state that depends on another source.
- No `resource` is required because the repository is not asynchronous yet.
