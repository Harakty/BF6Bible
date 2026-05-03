# Sprint 2 Build Solver Plan

## Goal

Add a solved build layer next to the existing template build layer.

The current `templateBuilds` output remains unchanged and continues to drive the UI. Sprint 2 adds `solvedBuilds` as a parallel generated dataset so we can inspect solver quality before switching any user-facing behavior.

## Non-Goals

- Do not replace `templateBuilds`.
- Do not change `App.tsx`.
- Do not change `metaEngine.ts`.
- Do not ingest external meta sources.
- Do not expose solved builds in UI during this sprint.

## Files To Add

- `src/buildSolver.ts`
  Pure TypeScript solver, importable by tests and generation scripts.

- `scripts/generateSolvedBuilds.mjs`
  Reads generated weapon and attachment data, calls the solver for all weapons, and writes `src/generated/solvedBuilds.ts`.

- `scripts/diffTemplateVsSolved.mjs`
  Manual markdown report comparing template attachments against solved attachments per weapon.

- `src/__tests__/buildSolver.test.ts`
  Unit and invariant coverage for solver behavior and scarcity logic.

- `src/__tests__/solvedBuilds.snapshot.test.ts`
  Golden snapshot for generated solved builds.

## Core Types

`buildSolver.ts` will introduce:

- `EffectKey`
- `EffectVector`
- `AttachmentSlot`
- `SolverAttachment`
- `ArchetypeId`
- `ArchetypeWeights`
- `ArchetypeProfile`
- `WeaponInputForSolver`
- `SolvedBuild`

The generated output will use `status: 'solved'` and include `rationaleData` for internal auditability.

## Solver Model

The attachment dataset effects are score points on abstract scales, not direct percentage deltas on weapon stats. The solver therefore operates in attachment effect space, with weapon stats used only as scarcity multipliers.

For each weapon and archetype:

1. Group attachments by slot: muzzle, barrel, underbarrel, laser.
2. Add a zero-cost "no attachment" option per slot.
3. Enumerate all valid slot combinations.
4. Reject combinations above the 100 point cap.
5. Sum effect vectors.
6. Score each combination with archetype weights and scarcity multipliers.
7. Return the best combination plus rationale data.

## Archetype Weights

The initial weights will be derived from the existing rationale text:

- `mid-control`: recoil/control, precision, projectile velocity, hidden signature.
- `close-redsec`: hipfire, ADS speed, ADS movement, draw speed.
- `anchor-sustain`: recoil control, recovery, precision, sway, accuracy over time.
- `info-range`: precision, control, projectile velocity, accuracy over time.
- `mobile-pick`: draw speed, projectile velocity, movement, hidden signature.
- `mobile-flex`: ADS speed, control, velocity, moving accuracy, hipfire.
- `building-clear`: hipfire, ADS speed, draw speed, hidden signature.
- `emergency-backup`: draw speed, hipfire, ADS speed.
- `balanced`: conservative mixed fallback.

These weights are baseline engineering assumptions. Sprint 3 consensus work can later calibrate them.

## Scarcity Multiplier

Scarcity is a small weapon-stat modifier:

- recoil-related effects get boosted when weapon control is low and discounted when control is already high.
- ADS-related effects get boosted when ADS is slow and discounted when ADS is already fast.
- all other effects default to `1.0`.

Initial thresholds:

- control `< 50`: `1.3`
- control `> 70`: `0.7`
- ADS `> 320ms`: `1.3`
- ADS `< 260ms`: `0.7`

## Tests

Solver invariants:

- total points are always `<= 100`
- at most one attachment per slot
- `objectiveScore` stays in `[0, 100]`
- deterministic output for identical input
- no `Math.random` in `buildSolver.ts`
- recoil-only archetype chooses the max recoil-control legal combo
- empty attachment input returns an empty zero-score build

Scarcity tests:

- low control boosts recoil-related effects
- high control discounts recoil-related effects
- neutral control stays at `1.0`
- slow ADS boosts ADS-related effects
- fast ADS discounts ADS-related effects

Generated output:

- `solvedBuilds.ts` exists for all 55 weapons
- golden snapshot records weapon, archetype, attachments, total points, and objective score

## CI Changes

Extend current snapshot detection to include solved build snapshots. Ranking snapshots and solved build snapshots should both trigger review PRs when automated refresh changes generated outputs.

## Manual Review Output

`scripts/diffTemplateVsSolved.mjs` must produce a markdown table showing:

- weapon
- archetype
- template attachments
- solved attachments
- total points
- objective score
- changed yes/no

The key qualitative check is that weapons with meaningfully different base stats, such as `KORD 6P67` and `VCR-2`, should not collapse to identical solved builds unless the objective data strongly justifies it.
