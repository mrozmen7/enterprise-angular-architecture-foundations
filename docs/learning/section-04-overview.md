# Chapter 4 — Immutable State Transitions

## Company requirement

Delivery managers must be able to change a selected project's priority. At the same time, every
Project Workspace state change must have an explicit reason and must not modify the previous state
object.

## Engineering pressure

At the end of Chapter 3, the application service changed state fields directly:

```text
state.searchTerm = value
state.statusFilter = value
state.selectedProjectId = value
```

This worked, but the state object itself did not explain why it changed. Direct mutation also
destroyed the previous value and made reference-based change reasoning harder.

## Learning goals

- distinguish mutation from immutable transition;
- model user intent as typed commands;
- use discriminated unions for valid command variants;
- implement a pure reducer;
- create new object and array references only when values change;
- preserve unchanged object references;
- apply `map` and object spread for immutable collection updates;
- use exhaustive `never` checking;
- verify transitions independently from Angular;
- connect an application service to a reducer through a single dispatch boundary.

## Target state flow

```text
Presentation event
  -> ProjectWorkspaceService method
      -> ProjectWorkspaceCommand
          -> reduceProjectWorkspace(previousState, command)
              -> next immutable state
                  -> template reads updated state
```

## Transition formula

```text
Previous State + Command = Next State
```

A reducer does not call APIs, modify the DOM, read the clock, or mutate its input. The same state
and command always produce the same result.
