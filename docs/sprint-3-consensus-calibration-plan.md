# Sprint 3 Consensus Calibration Plan

## Scope

Sprint 3 calibrates solved builds against a static consensus bootstrap and hardens the solver with robustness invariants before any UI promotion.

This branch is temporarily based on `feature/v2-calibration-and-polish` because GitHub still shows Sprint 2 and Sprint 2.5 PRs as open. Retarget to `main` after those branches land there.

## Principles

- Consensus is an oracle for disagreement, not a replacement for BF6 Bible scoring.
- No web scraping in this sprint.
- No UI promotion from template builds to solved builds.
- Do not change `metaEngine.ts` or archetype objective weights.
- Calibrate solver parameters only: budget pressure, effect caps, cost pressure clamps, and scarcity thresholds.

## Tasks

1. Add static `externalMetaConsensus.ts` curated from local `BF6 Bible research.md`.
2. Add `scripts/reportCalibrationGaps.mjs` and `npm run report:gaps`.
3. Add robustness invariants before calibration.
4. Iterate solver parameters until outliers and consensus disagreements are reduced.
5. Document baseline, iterations, and final state in `docs/calibration-log.md`.

## Validation

Run:

```bash
npm run refresh:data
npm run report:gaps
npm run test
npm run build
node scripts/reportRankingShifts.mjs
```

## Non Goals

- Do not scrape or ingest live external websites.
- Do not promote solved builds into the UI.
- Do not change `metaEngine.ts`.
- Do not change `archetypeProfiles.weights`.
- Do not invent consensus data when confidence is low.
