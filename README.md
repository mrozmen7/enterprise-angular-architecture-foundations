# Enterprise Angular Architecture Foundations — OpsFlow

[![CI](https://github.com/mrozmen7/enterprise-angular-architecture-foundations/actions/workflows/ci.yml/badge.svg)](https://github.com/mrozmen7/enterprise-angular-architecture-foundations/actions/workflows/ci.yml)

> Building a maintainable Angular 22 application from first principles through
> real enterprise requirements, architectural trade-offs, and production-minded practices.

## Why this repository exists

This repository is both a working Angular application and a public learning model. Instead of
presenting a finished architecture as a template to copy, it records how an architecture evolves
when business requirements, state, asynchronous work, and team constraints increase.

The product built during the course is **OpsFlow**, a project operations platform for consulting
teams. Each chapter starts with a realistic company request, exposes a concrete engineering
problem, and ends with code, tests, documentation, and an explicit architectural decision.

## Current status

**Chapter 3 complete — Separation of Concerns and Dependency Injection**

The Project Workspace is now a bounded feature with separate presentation, application, port,
infrastructure, and domain responsibilities. Angular Dependency Injection connects an abstract
repository contract to a local adapter without coupling the component or workflow to the data
source.

### Current evidence

- working project list, search, status filter, selection, detail, reset, and empty states;
- explicit Project, Customer, TeamMember, status, priority, and timeline models;
- runtime validation for required business text and valid date ranges;
- source state separated from derived filtered and selected project state;
- feature presentation separated from the root application shell;
- repository port with replaceable local and test implementations;
- `InjectionToken`, `useClass`, `useFactory`, and component-scoped workspace state;
- strict TypeScript and Angular template compilation;
- modern Angular template control flow with `@for`, `@if`, and `@empty`;
- twenty-seven passing domain, state, application, infrastructure, presentation, and shell tests;
- documented dependency direction, injector scope, and architecture decisions.

## Learning path

| Chapter | Focus                           | Enterprise outcome                                           |
| ------- | ------------------------------- | ------------------------------------------------------------ |
| 1 ✅    | Application and complexity      | Recognize responsibilities, state, and change pressure       |
| 2 ✅    | Domain and state modeling       | Represent business rules and valid states explicitly         |
| 3 ✅    | Separation of concerns and DI   | Isolate UI, application, domain, and infrastructure concerns |
| 4       | Immutable state transitions     | Make state changes predictable and traceable                 |
| 5       | Signals and derived state       | Build scoped, reactive state with clear ownership            |
| 6       | RxJS and concurrency            | Control cancellation, ordering, parallelism, and failures    |
| 7       | Server and distributed state    | Handle optimistic updates, stale data, and conflicts         |
| 8       | Testing and architecture review | Verify behavior and publish the reference architecture       |

## Technology baseline

- Angular 22 with standalone APIs
- TypeScript 6 in strict mode
- Angular Router
- SCSS
- RxJS 7
- Vitest and jsdom
- Node.js 24.15+

Advanced concerns such as SignalStore, zoneless Angular, SSR, and hydration belong to the separate
**Advanced Enterprise Angular** project. This repository first establishes the architectural
reasoning those tools depend on.

## Documentation

- [Course charter](docs/course-charter.md)
- [Eight-chapter roadmap](docs/roadmap.md)
- [OpsFlow product brief](docs/project-brief.md)
- [Chapter 1 learning guide](docs/learning/section-01-overview.md)
- [Chapter 1 completion review](docs/learning/section-01-completion.md)
- [Chapter 2 learning guide](docs/learning/section-02-overview.md)
- [Chapter 2 completion review](docs/learning/section-02-completion.md)
- [Chapter 3 learning guide](docs/learning/section-03-overview.md)
- [Chapter 3 completion review](docs/learning/section-03-completion.md)
- [CI/CD learning guide](docs/ci-cd.md)
- [Architecture Decision Records](docs/adr/README.md)
- [ADR 0001 — Model the Project Domain Explicitly](docs/adr/0001-model-project-domain-explicitly.md)
- [ADR 0002 — Invert the Project Data Dependency](docs/adr/0002-invert-project-data-dependency.md)
- [Security baseline](docs/security-baseline.md)
- [Tooling notes](docs/tooling-notes.md)

## Local development

```bash
npm install
npm start
```

Open `http://localhost:4200`.

Quality checks:

```bash
npm run build
npm test -- --watch=false
npm run format:check
```

## Learning language and public artifacts

Mentoring explanations and beginner learning guides are written in Turkish. Code, commit messages,
architecture records, and the primary GitHub presentation use professional English so the work can
be reviewed internationally.

## Project principle

> Start with the simplest design that satisfies today's requirement, then evolve it when evidence
> reveals a new architectural pressure.
