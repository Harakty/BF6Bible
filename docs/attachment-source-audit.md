# Sprint 6 Attachment Source Audit

Task 1 extends the solver model to seven attachment slots: muzzle, barrel, underbarrel, laser, optic, magazine, and ammo.

The generated attachment dataset is intentionally not expanded yet. The sprint contract requires point costs and numeric effects from public sources. I found public pages with attachment names, descriptions, and some point costs, but not enough numeric effect vectors to populate `recoilControl`, `drawSpeed`, `hipfire`, and the rest of the current solver effect model without inventing data.

## Sources Checked

- EA Help, Battlefield 6 loadouts: confirms the official loadout/customization surface, but does not expose attachment point costs or numeric effects.
- Battlefield Companion attachment index: exposes a larger public attachment list with point costs and descriptions. It includes optic/ammo-like entries such as `Baker 3.00x` and `Hollow Point`, but not the full numeric effect vector used by BF6Bible.
- Battlefield6.gg weapon pages: useful as a public weapon/loadout reference, but not sufficient as a structured source for every attachment effect in the BF6Bible schema.
- Local research consensus builds: references attachments such as `Polymer Case`, `36 RND Magazine`, `60 RND Magazine`, `5 RND Magazine`, `Baker 3.00x`, `BF-2M 2.50x`, `LERT 8.00x`, and specific barrel variants. The names are useful for gap tracking, but pointCost/effects are not all independently verified in a structured public source.

## Current Decision

No new attachment rows were added to `src/generated/attachmentData.ts` in Task 1.

Reason: adding optic, magazine, and ammo entries with fabricated effect vectors would violate the sprint constraint. The code now supports the slots and reports coverage, so the next decision is data-source selection:

1. Provide or approve a public/full attachment sheet with point costs and numeric effects.
2. Approve extending the current Google Sheet with verified rows and a source URL per attachment.
3. Narrow Sprint 6 to only the new attachments whose pointCost and effect vectors can be verified publicly.

## Coverage Baseline

Run:

```bash
npm run report:attachments
```

This prints count, target, max point cost, and total point cost per slot. The expected current result is below target for `optic`, `magazine`, and `ammo` until a verified source is connected.
