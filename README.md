# BF6 Bible

Data-driven REDSEC squad planner for Battlefield 6.

## Scope

- REDSEC Quads and Duos first.
- Bilingual interface: Italian and English.
- Weapon names, attachments, gadgets, and Field Specs are stored as localized terms so Italian and English labels can stay side by side.
- Season/version data is isolated in `src/data.ts` so Season 3, Ranked REDSEC, and Solos can be added as new datasets.
- Each role recommendation is a complete REDSEC weapon pair: one primary weapon and one true second weapon such as an SMG, carbine, DMR, or sniper depending on role. Pistols/sidearms are kept as a separate weapon category in the meta table, not as the squad's planned secondary.
- Weapon Meta is a dedicated view with general and role/class filters for Assault, Support, Engineer, and Recon.
- The Meta Tier view is a REDSEC-first ranking snapshot. It separates measured values from `TBD` values that still need automated data ingest.

## Data Policy

Every recommendation must keep a source trail and confidence score. Current seed sources:

- EA official REDSEC armor explanation.
- EA class guide.
- EA Season 3 / Ranked BR update.
- EA REDSEC Battle Royale 101.
- Sym.gg BF6 charts.
- BF6 Interactive Weapon Data community spreadsheet.
- BattlefieldMeta public comparator for secondary validation.
- Battlefield6.gg public REDSEC weapon catalog.

## Commands

```bash
npm install
npm run dev
npm run build
```
