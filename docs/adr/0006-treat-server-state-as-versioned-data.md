# ADR 0006 — Treat Server State as Versioned, Fallible Data

## Status

Accepted

## Context

Project data is now shared by multiple clients and processes. Browser memory can be stale, HTTP
requests can fail, API responses can violate their documented shape, and two users can update the
same project concurrently. Treating a local optimistic value as immediate server truth would risk
data loss and misleading UI.

## Decision

- Access project server state only through the `ProjectRepository` port.
- Implement the active adapter with Angular `HttpClient`.
- Treat HTTP response bodies as `unknown` until mapped and validated.
- Keep a short-lived cache inside the HTTP adapter with explicit `cache-first` and `network-only`
  policies.
- Add a positive integer `version` to each Project.
- Send `expectedVersion` with priority updates.
- Apply priority changes optimistically, reconcile on success, and roll back on ordinary failure.
- Convert HTTP 409 responses into `ProjectConflictError` carrying the latest validated server
  Project.
- Resolve the current conflict requirement by accepting server truth and informing the user.

## Alternatives considered

### Pessimistic UI updates

Wait for the server before changing the screen. This is simpler but makes a frequent lightweight
edit feel slow. It remains appropriate for irreversible or high-risk operations.

### Last write wins

Accept every write without version comparison. This is operationally simple but can silently erase
another employee's work.

### Global server-state library

Adopt a caching library immediately. The current feature has one aggregate and a small number of
workflows, so explicit repository policies remain easier to teach, test, and audit. This decision
can be revisited when cross-feature cache coordination becomes real.

### Expose DTOs directly to the application

This removes mapper code but lets transport changes and malformed JSON bypass domain rules.

## Consequences

- Server ownership, cache behavior, rollback, and conflict handling are explicit and testable.
- The application can replace the course API with a real backend without changing presentation or
  domain code.
- Every mutable server entity must maintain a trustworthy version.
- Optimistic flows require previous-state capture and more tests than pessimistic flows.
- The cache is intentionally local to one adapter instance and is not an offline database.
