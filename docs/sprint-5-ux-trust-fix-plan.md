# Sprint 5 UX Trust Fix Plan

## Scope

Sprint 5 improves trust, provenance, and user-facing build presentation without changing solver or ranking behavior.

## Tasks

1. Add user-facing archetype copy for every solved archetype.
2. Add user-facing effect copy for every effect key in solved builds.
3. Add weapon rationale copy for every weapon in the meta dataset.
4. Redesign the solved build panel with tier context, consensus badges, solver provenance, attachment setup, collapsible effects, attachment rationale, weapon rationale, and baseline source provenance.
5. Remove duplicated rationale and the residual range filler block.
6. Add tier context calculation in `MetaTierSection`.
7. Add an accessible methodology section/page and link it from provenance/tooltips.
8. Add UI copy coverage tests for archetypes, effects, and weapon rationales.
9. Run tests, build, and browser smoke checks.

## Non Goals

- No `buildSolver.ts` changes.
- No `metaEngine.ts` changes.
- No archetype profile, scarcity, cost pressure, or consensus recalibration.
- No live ingest.
- No template build deletion.
