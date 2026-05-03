# Sprint 6 Algorithmic Realignment Plan

Branch: `feature/v6-algorithmic-realignment`

Sprint 6 moves the project from trust-oriented presentation toward stricter algorithmic output:

1. Expand the attachment slot model from 4 to 7 slots (`muzzle`, `barrel`, `underbarrel`, `laser`, `optic`, `magazine`, `ammo`) only where public point/effect data is verifiable.
2. Redesign the build solver to spend all affordable slots and remove budget penalty logic.
3. Calibrate `metaEngine` with a consensus prior tested in representative scenarios.
4. Replace curated weapon rationale copy with runtime rationale generated from ranking/build metrics.

Checkpoint rule: Task 1 must stop before solver changes. If public sources do not expose pointCost/effects for optic, magazine, and ammo attachments, the sprint pauses with a documented source gap instead of inventing attachment data.
