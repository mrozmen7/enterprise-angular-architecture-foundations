# ADR 0003 — Use Immutable Workspace Transitions

## Status

Accepted

## Context

Project Workspace methods directly assigned search, filter, and selection fields. A new requirement
to update project priority introduced collection changes and increased the risk of scattered
mutation. The application needed one explicit and testable state-change boundary before adopting a
reactive state mechanism.

## Decision

- Model every supported state-change reason as a `ProjectWorkspaceCommand`.
- Route all workspace changes through one pure reducer.
- Make workspace state properties readonly and freeze state containers.
- Return the previous reference when a command produces no change.
- Return new state and collection references only for actual changes.
- Use immutable `map` and object spread to update project priority.
- Keep command creation inside application service workflow methods.

## Alternatives considered

### Continue direct mutation

This is concise but spreads transition logic across methods, removes the previous value in place,
and makes reference-based change reasoning less explicit.

### Introduce NgRx or another reducer library

The reducer pattern can be learned and tested without a library. Adding one now would obscure the
core mechanics and add infrastructure beyond current feature needs.

### Introduce Signals before transition modeling

Signals solve reactive read tracking, not the definition of valid state transitions. Transition
rules should be explicit before changing the reactive storage mechanism.

### Deep-clone the entire state for every command

This would be immutable but wasteful and would replace references for unchanged projects. Structural
sharing preserves unchanged values and makes change identity more meaningful.

## Consequences

- State changes have explicit names and payloads.
- Reducer behavior is deterministic and independently testable.
- Previous state remains available for comparison, logging, or future undo behavior.
- No-op transitions avoid unnecessary reference changes.
- More files and command definitions are required.
- Runtime freezing is shallow; nested domain values still rely on readonly contracts and controlled
  construction.
