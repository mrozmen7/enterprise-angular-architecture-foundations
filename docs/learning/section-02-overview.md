# Chapter 2 — Domain and State Modeling

## Company requirement

OpsFlow must represent projects consistently as the product grows. A project cannot be treated as
an arbitrary object whose status, priority, customer, owner, or dates can contain any value.

## Learning goals

- distinguish business domain concepts from UI state;
- build a shared domain vocabulary;
- model valid status and priority values with TypeScript;
- protect runtime invariants with a creation boundary;
- distinguish entity identity from display data;
- model source state and derived state without duplicating information;
- keep domain rules independent from Angular.

## Ubiquitous language

| Term                | Meaning in OpsFlow                                                        |
| ------------------- | ------------------------------------------------------------------------- |
| Project             | A customer delivery initiative with identity, ownership, state, and dates |
| Customer            | The organization receiving the project outcome                            |
| Team member         | The person responsible for delivery                                       |
| Project status      | The current lifecycle or delivery state                                   |
| Project priority    | The relative business attention assigned to the project                   |
| Start date          | The planned beginning of delivery                                         |
| Target date         | The planned delivery deadline                                             |
| Workspace state     | The user's current search, filter, selection, and visible project source  |
| Business invariant  | A rule that must remain true for a valid project                          |
| Selected project ID | The identity of the project selected by the user                          |
| Derived state       | A value calculated from existing source state                             |

## Architectural mental model

```text
Angular template
  -> App component
      -> Project workspace state
          -> Project domain model

Local seed data
  -> Project creation boundary
      -> Project domain model
```

Dependencies point toward the business model. The domain model does not import Angular, browser
APIs, templates, or styling.

## Chapter task

- move project concepts out of the root component;
- add explicit status, priority, customer, owner, and timeline models;
- reject missing required text and invalid date ranges;
- store selected project identity instead of duplicating a selected project object;
- derive filtered and selected projects with pure functions;
- enable strict TypeScript and Angular template checks;
- verify the domain, state, and component behavior independently.
