# Architecture Decision Records

Architecture Decision Records (ADRs) capture why a significant decision was made and what trade-offs
it introduces. They prevent architecture from becoming undocumented team folklore.

## Decision index

- [ADR 0001 — Model the Project Domain Explicitly](0001-model-project-domain-explicitly.md)
- [ADR 0002 — Invert the Project Data Dependency](0002-invert-project-data-dependency.md)
- [ADR 0003 — Use Immutable Workspace Transitions](0003-use-immutable-workspace-transitions.md)
- [ADR 0004 — Use Signals for Workspace Reactivity](0004-use-signals-for-workspace-reactivity.md)
- [ADR 0005 — Encode Concurrency Policies with RxJS](0005-encode-concurrency-with-rxjs.md)
- [ADR 0006 — Treat Server State as Versioned, Fallible Data](0006-treat-server-state-as-versioned-data.md)

## File naming

```text
0001-short-decision-title.md
```

## Template

```markdown
# ADR 0001 — Decision title

## Status

Proposed | Accepted | Superseded

## Context

What requirement or engineering pressure requires a decision?

## Decision

What will we do?

## Alternatives considered

What realistic alternatives were evaluated?

## Consequences

What becomes easier, harder, or constrained?
```
