# Contributing

Thank you for improving this learning reference.

## Before opening a pull request

```bash
npm ci
npm run format:check
npm run architecture:check
npm run test:ci
npm run build
```

## Contribution principles

- Start from a concrete business or engineering requirement.
- Preserve dependency direction or document why it must change.
- Add tests for the important success and failure paths.
- Update the relevant learning guide and ADR when behavior or architecture changes.
- Keep examples free of secrets, credentials, real customer data, and proprietary code.
- Use clear English for code and public repository artifacts.

Small, focused pull requests are easier to review and teach from.
