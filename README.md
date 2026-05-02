# BF6 Bible

Data-driven REDSEC squad planner for Battlefield 6.

## Scope

- REDSEC Quads and Duos first.
- Bilingual interface: Italian and English.
- Weapon names, attachments, gadgets, and Field Specs are stored as localized terms so Italian and English labels can stay side by side.
- Season/version data is isolated in `src/data.ts` so Season 3, Ranked REDSEC, and Solos can be added as new datasets.

## Data Policy

Every recommendation must keep a source trail and confidence score. Current seed sources:

- EA official REDSEC armor explanation.
- EA class guide.
- EA Season 3 / Ranked BR update.
- Sym.gg BF6 charts.
- BF6 Interactive Weapon Data community spreadsheet.
- BattlefieldMeta public comparator for secondary validation.

## Commands

```bash
npm install
npm run dev
npm run build
```
