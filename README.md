# BF6 Bible

Data-driven REDSEC squad planner for Battlefield 6.

## Scope

- REDSEC Quads and Duos first.
- Bilingual interface: Italian and English.
- Weapon names, attachments, gadgets, and Field Specs are stored as localized terms so Italian and English labels can stay side by side.
- Season/version data is isolated in `src/data.ts` so Season 3, Ranked REDSEC, and Solos can be added as new datasets.
- Each role recommendation is a complete REDSEC weapon pair: one primary weapon and one true second weapon such as an SMG, carbine, DMR, or sniper depending on role. Pistols/sidearms are kept as a separate weapon category in the meta table, not as the squad's planned secondary.
- Weapon Meta is a dedicated Meta Lab with scenario weights for General, Assault, Support, Engineer, and Recon.
- The Meta Lab uses `src/metaEngine.ts` and generated sheet data to calculate tiers from body TTK, REDSEC 180 HP proxy TTK, range retention, control, sustain, mobility, role fit, and data quality.
- The REDSEC planner uses tactical SVG diagrams for Quads and Duos instead of decorative map art, so positioning rules can evolve as data changes.

## Data Policy

The weapon stat pipeline reads the public Google Sheet configured in `scripts/ingestWeapons.mjs`, parses 55 weapons, and writes `src/generated/weaponStats.ts`. The generated model includes damage curves at 0/10/20/35/50/70/80 m, STK/TTK for 100 HP, click TTK, and a 180 HP REDSEC proxy until a reliable armor-damage dataset is available.

Every recommendation must keep a source trail. Current sources:

- EA official REDSEC armor explanation.
- EA class guide.
- EA Season 3 / Ranked BR update.
- EA REDSEC Battle Royale 101.
- Sym.gg BF6 charts.
- BF6 Public Weapon Stats Sheet.
- BattlefieldMeta public comparator for secondary validation.
- Battlefield6.gg public REDSEC weapon catalog.
- Public BF6 attachment cost sheet, ingested with `npm run ingest:attachments`.

The app does not scrape private endpoints. It fetches a public CSV export, keeps a generated snapshot in the repo, and can be refreshed with `npm run ingest:weapons`.
Attachment cost/effect data is also pulled from a public CSV export and stored as a generated snapshot. The next build-engine step can use this data to generate algorithmic builds for every weapon before team validation.

## Commands

```bash
npm install
npm run ingest:weapons
npm run ingest:attachments
npm run generate:builds
npm run dev
npm run build
```
