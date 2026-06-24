# OpsFlow Product Brief

## Company context

OpsFlow is an internal project operations platform for a consulting company. Delivery teams need a
shared view of customers and active projects without relying on disconnected spreadsheets and chat
messages.

## Primary users

- **Delivery manager:** monitors project status, ownership, and delivery risk.
- **Consultant:** finds assigned work and reviews project details.
- **Operations specialist:** keeps customer and project information accurate.

## Initial business request

Employees must be able to:

1. view customer projects;
2. search projects by name or customer;
3. filter projects by status;
4. select a project and inspect its details;
5. understand the current project state without ambiguous labels.

## Planned change pressure

Later requests will introduce edits, validation, asynchronous persistence, optimistic feedback,
failures, stale data, and concurrent updates. These are introduced gradually so each architectural
decision has observable motivation.

## Out of scope for the foundations project

- production authentication and authorization;
- microfrontends and monorepo orchestration;
- NgRx SignalStore;
- server-side rendering and hydration;
- advanced deployment infrastructure.

Those concerns are valuable, but adding them before the foundations are understood would hide the
reasoning this repository is designed to teach.
