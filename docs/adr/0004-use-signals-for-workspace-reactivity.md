# ADR 0004 — Use Signals for Workspace Reactivity

## Status

Accepted

## Context

Immutable reducer transitions provided reliable state references, but Project Workspace values were
exposed through ordinary getters. The Angular presentation needed fine-grained reactive reads while
preserving the command and reducer write boundary.

## Decision

- Replace the stateful application service with an Angular-specific `ProjectWorkspaceStore`.
- Store source state in one private `WritableSignal<ProjectWorkspaceState>`.
- Expose source state through `asReadonly()`.
- Derive filtered projects, selection, count, and filter status with `computed`.
- Keep commands, reducer, state functions, domain, and repository port Angular-independent.
- Use the default signal referential equality because the reducer returns stable references for
  no-op transitions.
- Do not add effects without a required non-reactive external side effect.

## Alternatives considered

### Expose the writable signal publicly

This would let components call `set` or `update` and bypass commands, validation, and reducer
semantics.

### Keep ordinary getters

The feature would continue to work, but Angular would not have an explicit reactive dependency graph
for source and derived values.

### Store every derived value in its own writable signal

This would duplicate state and create synchronization problems between projects, filters, counts,
and selection.

### Use an effect to synchronize derived state

Effects are intended for non-reactive external APIs, not for propagating state between signals.
`computed` expresses derivation without imperative synchronization.

### Configure deep equality

The reducer already preserves references for no-op transitions and creates new references for real
changes. Deep equality would add runtime cost and obscure that contract.

## Consequences

- The template automatically participates in Angular's signal dependency graph.
- Consumers can observe but cannot directly write source state.
- Derived values are lazy and memoized.
- The reactive store imports Angular, while the transition core remains portable.
- Async server behavior still requires a later RxJS or resource decision.
