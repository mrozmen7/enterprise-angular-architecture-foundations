# Security Baseline

Baseline date: **2026-06-25**

## Runtime dependencies

`npm audit --omit=dev` reports **0 known vulnerabilities**.

## Development toolchain

The full audit reports five transitive findings in Angular's build toolchain:

- `@babel/core`: advisory without an available upstream fix;
- `piscina`: advisory without an available upstream fix;
- `esbuild`: development-server advisory with an available transitive update.

These packages are development dependencies and are not shipped in the browser production bundle.
No `npm audit fix --force` is applied because an automatic breaking dependency change would be less
controlled than tracking the upstream Angular toolchain updates. Findings will be reviewed whenever
the Angular patch version changes.

## Policy

- Production and development findings are evaluated separately.
- Breaking automatic fixes are never applied without build, test, and compatibility review.
- Secrets and real customer data are prohibited from the repository.
- A clean audit does not replace secure design or dependency review.
