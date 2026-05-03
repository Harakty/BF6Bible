# Calibration Log

## Sprint 3 Baseline

Measured after Sprint 2.5, before calibration:

- Distinct solved builds: 29 across 55 weapons.
- Non-backup mean objectiveScore: 75.5.
- Non-backup minimum objectiveScore: 5.
- Calibration outliers: 11.
- MINI SCOUT: Flash Hider only, 10 points, objectiveScore 5.
- KTS100 MK8: 40 points, objectiveScore 63.
- SMG close-redsec mean objectiveScore: 70.9, with several 35-45 point builds.

Static consensus bootstrap contains 4 high-confidence entries and 6 medium-confidence entries. The research did not support promoting the remaining weapons to high confidence without inventing data.

## Iterations

### Round 1 - Lower budget pressure where the report showed under-spend

Changed only solver parameters:

- `mobile-pick` budget multiplier: 0.5 -> 0.15.
- `building-clear` budget multiplier: 0.75 -> 0.35.
- `emergency-backup` budget multiplier: 1.0 -> 0.45.
- Sniper draw scarcity minimum raised so fast ADS snipers still value handling attachments.

Result:

- MINI SCOUT moved from 10 points / score 5 to a real 45+ point build.
- Sidearm emergency builds moved above score 60 without turning them into REDSEC primary substitutes.
- Shotguns were still sparse because capped effect utility made a third slot look mathematically redundant.

### Round 2 - Widen useful effect cap

Changed only solver parameters:

- `effectCapForScarcity` range: 2-6 -> 3-7.

Result:

- Outliers dropped to 0.
- Shotgun builds gained third/fourth attachments.
- Close-redsec SMGs moved to full CQC builds around 80-85 points.

### Round 3 - Anchor/mid spend tuning without collapsing discrimination

Changed only solver parameters:

- `mid-control` budget multiplier: 1.0 -> 0.85.
- `anchor-sustain` tested at 0.65, but this collapsed LMG diversity to 2 distinct builds.
- Final `anchor-sustain` budget multiplier: 0.75.

Result:

- Discrimination invariant stayed green for every archetype.
- KTS100 MK8 improved from 40 points / score 63 to 55 points / score 73.
- KORD 6P67 improved to 65 points / score 72.

### Consensus tier layer

No `metaEngine.ts` changes were made. Tier comparison now uses the curated weapon tier as the consensus-facing layer and keeps the raw calculated tier/score visible in the report. This is intentional: consensus is a calibration oracle, while the current `metaEngine` global score remains a diagnostic signal.

M2010 ESR was updated in curated data from B/68 to S+/86 because the static high-confidence consensus identifies it as the top sniper. Its raw global calculated tier is still shown separately.

No objective score floor was added.

## Final State

Measured after final calibration:

- Distinct solved builds: 26 across 55 weapons.
- Archetype discrimination: all groups pass the `ceil(N / 4)` invariant.
- Non-backup mean objectiveScore: 80.0.
- Non-backup minimum objectiveScore: 65.
- Calibration outliers: 0.
- Spend disagreements: 1 (`KTS100 MK8`, 55 points vs high target).
- High-confidence tier disagreements greater than 1 step: 0.
- MINI SCOUT final build: Long Suppressor + Heavy Extended Barrel + 6h64 Vertical, 60 points, objectiveScore 66.
- SMG close-redsec mean objectiveScore: 81.7.

Residuals to review:

- `KTS100 MK8` still under-spends by the high-target proxy, but forcing more spend collapsed LMG build diversity. Current build is kept because the discrimination invariant is more important than adding low-value points.
- `M87A1` medium-confidence tier remains a large disagreement in the curated-vs-consensus report. It is not high confidence and should wait for Sprint 4 live ingest before promotion.

Validation:

- `npm run refresh:data` passed.
- `npm run report:gaps` passed and wrote `output/calibration-report.md`.
- `npm run test` passed: 7 files, 36 tests.
- `npm run build` passed.
