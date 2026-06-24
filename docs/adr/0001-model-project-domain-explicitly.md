# ADR 0001 — Model the Project Domain Explicitly

## Status

Accepted

## Context

The first Project Workspace stored project objects, filter fields, and selected project data inside
the root Angular component. Status and other business fields were unrestricted strings. As new
attributes and rules arrived, the component became responsible for both business validity and UI
behavior.

## Decision

- Represent Project, Customer, TeamMember, ProjectStatus, and ProjectPriority as explicit
  TypeScript domain types.
- Keep the domain free of Angular dependencies.
- Create projects through a runtime validation boundary.
- Represent workspace interaction separately from the Project domain.
- Store selected project identity and derive the selected entity from the canonical collection.
- Enable strict TypeScript and Angular template compilation.

## Alternatives considered

### Keep inline objects inside the component

This is initially shorter but allows UI code, business vocabulary, and validity rules to remain
coupled.

### Use classes for every domain concept

Classes can encapsulate behavior, but most current concepts are immutable data contracts. Adding a
class hierarchy now would introduce ceremony without demonstrated behavioral value.

### Add a state management library

The current state is local and small. A library would hide the ownership and modeling lessons that
must be understood before selecting a state tool.

## Consequences

- Business vocabulary is reusable and independently testable.
- Invalid dates and required text are rejected at project creation.
- Supported status and priority values are compiler checked.
- The component imports more files, but each dependency has a narrower responsibility.
- State mutation is still direct and will be addressed when Chapter 4 introduces immutable
  transitions.
- External API validation remains future work because no server boundary exists yet.
