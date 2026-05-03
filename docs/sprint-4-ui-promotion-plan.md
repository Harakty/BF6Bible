# Sprint 4 UI Promotion Plan

## Scope

Promote the weapon meta build panel from template builds to solved builds.

## Tasks

1. Extend `src/buildEngine.ts` with solved build exports, lookup, and point label helpers.
2. Switch `MetaTierSection` in `src/App.tsx` from template build selection to solved build selection.
3. Add solved build copy keys while keeping template copy keys intact.
4. Keep the refresh pipeline unchanged so template builds remain available for internal audit.
5. Run the existing test suite, production build, and browser smoke check.

## Non Goals

- No live ingest.
- No solver changes.
- No `metaEngine.ts` changes.
- No consensus dataset changes.
- No new build-detail UI such as `rationaleData` or effect breakdown.
