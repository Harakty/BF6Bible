# Sprint 7 Hybrid Data-Driven Plan

Sprint 7 replaces the incomplete pure-solver expansion with a hybrid architecture:

- Layer A: BF6Bible solver remains authoritative for the attachment slots where we have numeric effect data.
- Layer B: battlefieldmeta.gg consensus is scraped literally for slots that BF6Bible does not cover with numeric effects.
- Build generator must produce full 100/100 builds for primary weapons.

## Sequence

1. Add battlefieldmeta.gg consensus scraper, local cache, coverage report, and dataset tests.
2. Define Layer A/Layer B slot authority and extend attachment schema with source provenance.
3. Generate hybrid builds by solving Layer A against the remaining budget after Layer B consensus slots.
4. Replace curated rationale with runtime, metric-based rationale and expose attachment provenance in UI.
5. Calibrate metaEngine against consensus tiers after consensus coverage exists for every weapon.

## Checkpoints

Checkpoint after Task 1: PR draft shows scraper output and consensus coverage before Layer A/B merge work starts.

Checkpoint after Task 2: Claudone validates the extended attachment dataset and source provenance.

Checkpoint after Task 3: Claudone validates generated hybrid builds on KORD 6P67, M2010 ESR, MINI SCOUT, KTS100 MK8, and VZ.61.

## Constraints

- Do not invent attachment names, costs, effects, or rationale.
- Respect battlefieldmeta.gg robots.txt and keep fetch rate at or below one request per second.
- Cache fetched HTML under `data/cache/battlefieldmeta/` with a seven-day TTL.
- Keep commits separated by task.
