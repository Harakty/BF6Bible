# Sprint 2.5 Calibration And Polish Plan

## Scope

Sprint 2.5 tightens the build solver and fixes two UI/copy polish items before solved builds are promoted to the visible app.

This branch is intentionally based on `feature/v2-build-solver` while PR #2 is still open. Retarget to `main` after Sprint 2 lands there.

## Tasks

1. Rebrand the AppHeader tagline to:
   - IT: `Zero Opinioni, Solo Dati`
   - EN: `Zero Opinions, Only Data`

2. Fix the meta tier row build button:
   - Meta tier rows should always open the weapon-specific template build panel.
   - Remove curated loadout routing from `MetaTierSection`.
   - Keep `CuratedMetaBuildPanel` available for planner flows.

3. Replace step-based `scarcityMultiplier` with a continuous clamped function:
   - recoil effects use weapon control with a neutral pivot around 60
   - ADS effects use ADS time with a neutral pivot around 290 ms
   - clamp the multiplier into a bounded range so missing or extreme stats cannot dominate the solver

4. Add solved-build discrimination coverage:
   - for every archetype with at least 4 weapons, require distinct builds >= `max(2, ceil(N / 4))`
   - run against `generatedSolvedBuilds`
   - fail intentionally if the solver collapses most weapons in the same archetype into one build

## Validation

Run:

```bash
npm run refresh:data
npm run diff:builds
npm run test
npm run build
```

If the discrimination invariant fails, tune the continuous scarcity parameters instead of relaxing the bound.

## Non Goals

- Do not promote `solvedBuilds` into the UI yet.
- Do not touch `metaEngine.ts`.
- Do not change archetype objective weights.
- Do not change attachment source data.
- Do not rename template copy keys yet.
