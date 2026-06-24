# Eight-Chapter Roadmap

## 1. Application and complexity

Build the first Project Workspace and learn Angular's component, template, event, and state model.
Observe how changing requirements create additional responsibilities.

**Evidence:** working feature, responsibility map, complexity review.

## 2. Domain and state modeling

Model customers, projects, project status, request state, and business invariants explicitly with
TypeScript.

**Evidence:** domain vocabulary, valid state model, domain tests.

## 3. Separation of concerns and dependency injection

Separate presentation, application workflow, domain rules, and external data access. Introduce
dependency injection from first principles.

**Evidence:** dependency diagram, replaceable data adapter, focused tests.

## 4. Immutable state transitions

Replace scattered mutation with explicit commands, immutable collection operations, and traceable
state transitions.

**Evidence:** transition table, immutable CRUD, transition tests.

## 5. Signals and derived state

Introduce signals only after state ownership is clear. Separate source state from computed state and
scope state to the smallest valid lifetime.

**Evidence:** signal-based feature state, derived views, ownership ADR.

## 6. RxJS and concurrency

Handle search cancellation, queued saves, duplicate submission prevention, parallel work, and
recoverable stream errors.

**Evidence:** concurrency decision table and deterministic tests.

## 7. Server and distributed state

Introduce an API boundary, request status, optimistic updates, rollback, stale data, and concurrent
user changes.

**Evidence:** failure-safe workflow, conflict scenario, server-state ADR.

## 8. Testing and architecture review

Apply risk-based tests, audit dependency direction, review architecture fitness, and publish the
final reusable reference.

**Evidence:** test strategy, architecture guide, final project review.
