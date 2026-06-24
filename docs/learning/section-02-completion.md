# Chapter 2 — Completion Review

## Delivered domain model

```text
Project
  ├── ProjectId
  ├── name
  ├── Customer
  │   ├── CustomerId
  │   ├── name
  │   └── industry
  ├── TeamMember
  │   ├── TeamMemberId
  │   ├── name
  │   └── role
  ├── ProjectStatus
  ├── ProjectPriority
  ├── summary
  ├── startDate
  └── targetDate
```

Supported statuses are `Planning`, `Active`, `At Risk`, and `Completed`. Supported priorities are
`Low`, `Medium`, and `High`. TypeScript union types prevent unsupported values in trusted
application code, while runtime guards can validate values arriving from untyped boundaries.

## Business invariants

The `createProject` boundary rejects projects when:

- required project, customer, or owner text is empty;
- a date is not a real calendar date in `YYYY-MM-DD` format;
- the target date is earlier than the start date.

The factory also trims business text before returning the project.

## State model

```text
ProjectWorkspaceState
  ├── projects              source state
  ├── searchTerm            source state
  ├── statusFilter          source state
  └── selectedProjectId     source state

getFilteredProjects(state)  derived state
getSelectedProject(state)   derived state
```

The selected project object is not stored twice. Its identity is stored and the current project is
derived from the canonical project collection. This prevents a stale selected object from
disagreeing with the collection.

## Dependency direction

```text
app.html
  -> app.ts
      -> projects/application/project-workspace.state.ts
          -> projects/domain/*
      -> projects/data/project.seed.ts
          -> projects/domain/*
```

The domain layer has no dependency on Angular. Framework code depends on the business model, not
the other way around.

## Strictness baseline

The project now enables:

- TypeScript `strict`;
- Angular `strictTemplates`;
- strict injection parameter checking;
- strict input access modifier checking.

These compiler checks make invalid connections visible before runtime.

## Test evidence

Twenty tests across three suites verify:

- Angular component rendering and user behavior;
- valid project creation and text normalization;
- required project name enforcement;
- real ISO calendar date validation;
- chronological date rules;
- runtime status and priority guards;
- predictable initial workspace state;
- combined search and status filtering;
- selected project derivation by identity;
- missing selection handling.

## Deliberate boundaries

- The local seed file is still a temporary data source; Chapter 3 will place data access behind an
  injected boundary.
- The component still mutates workspace fields directly; Chapter 4 will introduce explicit
  immutable state transitions.
- Derived state uses pure functions called by component getters; Chapter 5 will introduce Signals
  and computed state after ownership is established.
- Runtime guards exist, but no server DTO boundary exists yet; Chapter 7 will validate external
  server data.

These are intentional learning boundaries, not accidental omissions.
