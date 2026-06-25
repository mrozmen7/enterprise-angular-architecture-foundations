# Chapter 4 — Completion Review

## Command model

The Project Workspace supports these explicit state-change reasons:

```text
search-changed
status-filter-changed
project-selected
project-priority-changed
filters-reset
selection-cleared
```

The commands form a TypeScript discriminated union. Each command carries only the data required for
that transition.

## Transition table

| Command                    | Changed state                 | Preserved state                        |
| -------------------------- | ----------------------------- | -------------------------------------- |
| `search-changed`           | `searchTerm`                  | projects, filter, selection            |
| `status-filter-changed`    | `statusFilter`                | projects, search, selection            |
| `project-selected`         | `selectedProjectId`           | projects and filters                   |
| `project-priority-changed` | one project and projects list | filters, selection, unrelated projects |
| `filters-reset`            | search and status filter      | projects and selection                 |
| `selection-cleared`        | `selectedProjectId`           | projects and filters                   |

## Reducer contract

```text
reduceProjectWorkspace(previousState, command)
  -> previousState when nothing changes
  -> a frozen next state when a value changes
```

The reducer:

- never mutates the previous state;
- returns the same reference for no-op commands;
- returns a new state reference for real changes;
- refuses to select an identity missing from the project collection;
- updates priority with `map` and object spread;
- preserves references for unrelated projects;
- uses exhaustive `never` checking for command coverage.

## Immutable priority update

```text
Previous projects array
  ├── Project A: new object with updated priority
  ├── Project B: same object reference
  └── Project C: same object reference

Next projects array: new array reference
Previous projects array: unchanged
```

This minimizes replacement while keeping the transition immutable.

## Application service boundary

The service now owns one private state reference:

```text
private currentState
```

Public workflow methods create commands. Only the private `dispatch` method replaces the current
state:

```text
method -> command -> reducer -> currentState replacement
```

No workflow method assigns directly to a state field.

## Runtime and compile-time protection

- State properties and commands are `readonly`.
- Initial and reducer-created state objects are frozen.
- Project collections stored in state are frozen.
- Command payloads are restricted by TypeScript.
- Unknown commands reach an exhaustive failure path at runtime.

## Test evidence

Thirty-nine tests across seven suites verify:

- previous state preservation;
- new references for real changes;
- stable references for no-op transitions;
- selection validity;
- filter reset semantics;
- immutable project priority updates;
- unchanged project reference preservation;
- frozen state objects;
- application service dispatch behavior;
- presentation priority updates;
- all earlier domain, DI, repository, state, and UI behavior.

## Deliberate boundaries

- The service still exposes state through normal getters. Chapter 5 will replace read tracking with
  Signals and computed state.
- Commands are dispatched synchronously because no asynchronous workflow exists yet.
- The repository remains read-only and local. Server persistence and failure handling belong to
  Chapter 7.
- Full audit logging is not added, but explicit commands create the vocabulary required for it.
