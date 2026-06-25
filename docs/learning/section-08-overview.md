# Chapter 8 — Testing and Architecture Review

## Company requirement

OpsFlow is ready to become a public reference architecture. The team must prove that behavior,
dependency direction, production compilation, accessibility fundamentals, and deployment remain
correct when future contributors change the code.

## Engineering pressure

A test suite can remain green while:

- presentation starts calling `HttpClient` directly;
- application code imports a concrete adapter;
- manual subscriptions leak;
- focused or skipped tests reach `main`;
- the application fails under a repository base path;
- documentation claims evidence that CI does not verify.

Testing therefore includes both business behavior and architecture fitness.

## Learning goals

- choose tests by risk instead of chasing a number;
- distinguish unit, integration, adapter, architecture, and smoke tests;
- encode dependency rules as an automated fitness function;
- review accessibility as application behavior;
- build a production artifact for a non-root deployment path;
- understand CI artifact and CD environment boundaries;
- publish a traceable release and professional reference repository.

## Final quality model

```text
Business behavior
  + architecture boundaries
  + accessibility fundamentals
  + production compilation
  + deployment smoke test
  + current documentation
  = reference architecture evidence
```

## Deployment model

```text
GitHub main
  -> verify
  -> build with repository base href
  -> upload immutable Pages artifact
  -> deploy through github-pages environment
  -> verify public HTTPS URL
```
