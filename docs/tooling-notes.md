# Tooling Notes

## Angular build cache disabled

Date: **2026-06-21**

Environment:

- macOS arm64
- Node.js 24.15.0
- Angular CLI 22.0.3
- Angular 22.0.2

The Angular persistent build cache triggered a native LMDB `SIGABRT` during the initial production
build. Tests and compilation succeeded when persistent cache was disabled in `angular.json`.

The cache is an optimization, not an application requirement. It remains disabled so the learning
environment is deterministic. This decision should be revisited after an Angular/build-tool patch;
the application must pass the same build and test checks before the cache is re-enabled.
