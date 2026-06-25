# Chapter 5 — Signals and Derived State

## Company requirement

The Project Workspace must react automatically when search, filter, selection, or project priority
changes. Presentation code must be able to observe state without gaining permission to change it
outside the command and reducer workflow.

## Engineering pressure

At the end of Chapter 4, immutable transitions produced reliable state references, but the
application service exposed values through ordinary getters. Angular could only discover changes
through its general change-detection cycle; the state owner did not describe which consumers used
which values.

## Learning goals

- understand signals as reactive value containers;
- distinguish `WritableSignal<T>` from readonly `Signal<T>`;
- keep the writable source private and expose `asReadonly()`;
- read signal values through getter invocation;
- derive values with `computed`;
- understand lazy evaluation, memoization, and invalidation;
- understand dynamic dependency tracking;
- connect signal reads to `OnPush` templates;
- rely on reducer reference stability and the default `Object.is` equality;
- distinguish derivations from side effects;
- understand when `effect` and `untracked` are appropriate.

## Target reactive flow

```text
Presentation event
  -> ProjectWorkspaceStore method
      -> command
          -> immutable reducer
              -> stateSource.update(...)
                  -> readonly state Signal
                      -> computed Signals
                          -> OnPush template consumers
```

## Source and derived state

```text
Source Signal
  state
    ├── projects
    ├── searchTerm
    ├── statusFilter
    └── selectedProjectId

Computed Signals
  ├── searchTerm
  ├── statusFilter
  ├── filteredProjects
  ├── selectedProject
  ├── projectCount
  └── hasActiveFilters
```

Only source state is writable. Derived state is recomputed from the source and is never manually
synchronized.
