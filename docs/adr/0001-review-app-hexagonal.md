# ADR 0001: Hexagonal layout for the review app

## Status

Accepted for the v0.3 draft tool.

## Context

Check my car park has to validate OPMS, draw a level, record a review, and stay testable without a browser for most of the rules.

## Decision

The TypeScript app in `tools/review-app` is split into domain, application, adapters, and ui. Domain and application do not import the DOM, Ajv, or Preact. Use cases take ports for the schema validator, the clock, and storage. Dependency Cruiser fails the build if an import points outward.

## Consequences

Schema files and the SVG map can change without rewriting the tier rules. The UI stays a thin caller of the use cases.
