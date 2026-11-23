# ADR 0002: The review tool stays in the browser

## Status

Accepted for the v0.3 draft tool.

## Context

A car park dataset can describe a private site. The owner asked for no uploads and no backend.

## Decision

The app runs entirely in the browser and is published as static files under `docs/review/`. A floor plan is read with a local object URL. An OSM tile is requested only after the user opts in, and only for an open-air or roof level. The default is off.

## Consequences

There is no account and no shared review until someone exports the JSON and sends it themselves. A saved draft stays in that browser's localStorage.
