import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { metaWeapons } from '../src/data.ts'
import { consensusBuilds } from '../src/generated/consensusBuilds.ts'
import { generatedSolvedBuilds } from '../src/generated/solvedBuilds.ts'
import { rankWeapons } from '../src/metaEngine.ts'
import { normalizeWeaponName } from '../src/weaponStats.ts'

const OUTPUT_PATH = resolve('output/calibration-report.md')
const tierOrder = ['D', 'C', 'B', 'A', 'S', 'S+']

function buildName(build) {
  return build.attachments.map((attachment) => attachment.name.en).join(' + ') || 'None'
}

function sourceSlug(sourceUrl) {
  return sourceUrl.split('/').filter(Boolean).at(-1)
}

function consensusComparableTier(tier) {
  return tier === 'META' ? 'S' : tier
}

function tierDistance(a, b) {
  return Math.abs(tierOrder.indexOf(a) - tierOrder.indexOf(b))
}

function severityForTierDistance(distance) {
  if (distance > 1) return 'flag'
  if (distance === 1) return 'warning'
  return 'ok'
}

function rowLimit(rows) {
  return rows.slice(0, 100)
}

function markdownTable(headers, rows) {
  if (rows.length === 0) return '_None._'
  const header = `| ${headers.join(' | ')} |`
  const divider = `| ${headers.map(() => '---').join(' | ')} |`
  return [header, divider, ...rows].join('\n')
}

function sanitize(value) {
  return String(value).replaceAll('|', '\\|')
}

function normalizedMap(entries, keyFn) {
  const map = new Map()
  for (const entry of entries) {
    map.set(normalizeWeaponName(keyFn(entry)), entry)
  }
  return map
}

const solvedByWeapon = normalizedMap(generatedSolvedBuilds.builds, (build) => build.weaponName)
const rankedByWeapon = normalizedMap(rankWeapons(metaWeapons, 'all'), (ranked) => ranked.metric.weapon.name.en)

const consensusEntries = Object.entries(consensusBuilds.builds).map(([weaponName, consensus]) => ({
  weaponName,
  consensus,
  aliases: [weaponName, sourceSlug(consensus.sourceUrl)].filter(Boolean).map(normalizeWeaponName),
}))

const outliers = []
for (const build of generatedSolvedBuilds.builds) {
  if (build.totalPoints !== build.weaponMaxBudget) {
    outliers.push({
      priority: 1,
      weapon: build.weaponName,
      archetype: build.archetype.id,
      score: build.objectiveScore,
      points: `${build.totalPoints}/${build.weaponMaxBudget}`,
      build: buildName(build),
      issue: 'Cap mismatch',
      suspicion: 'hybrid generator failed to close weapon cap',
    })
  }

  if (build.objectiveScore < 50) {
    outliers.push({
      priority: 2,
      weapon: build.weaponName,
      archetype: build.archetype.id,
      score: build.objectiveScore,
      points: `${build.totalPoints}/${build.weaponMaxBudget}`,
      build: buildName(build),
      issue: 'Score too low',
      suspicion: 'Layer A utility still weak after consensus layer',
    })
  }
}

outliers.sort((a, b) => a.priority - b.priority || a.score - b.score)

const tierDisagreements = []
for (const entry of consensusEntries) {
  const ranked = entry.aliases.map((alias) => rankedByWeapon.get(alias)).find(Boolean)
  if (!ranked) continue
  const comparableConsensus = consensusComparableTier(entry.consensus.tier)
  const distance = tierDistance(ranked.calculatedTier, comparableConsensus)
  if (distance === 0) continue

  tierDisagreements.push({
    weapon: ranked.metric.weapon.name.en,
    calculatedTier: ranked.calculatedTier,
    consensus: entry.consensus.tier,
    distance,
    severity: severityForTierDistance(distance),
    score: ranked.score,
  })
}
tierDisagreements.sort((a, b) => b.distance - a.distance || b.score - a.score)

const capRows = []
for (const entry of consensusEntries) {
  const build = entry.aliases.map((alias) => solvedByWeapon.get(alias)).find(Boolean)
  if (!build) continue

  const recommended = entry.consensus.variants.Recommended
  if (recommended.totalPoints < entry.consensus.weaponMaxBudget) {
    capRows.push({
      weapon: build.weaponName,
      consensus: `${recommended.totalPoints}/${entry.consensus.weaponMaxBudget}`,
      ours: `${build.totalPoints}/${build.weaponMaxBudget}`,
      topUp: build.totalPoints - recommended.totalPoints,
    })
  }
}
capRows.sort((a, b) => b.topUp - a.topUp || a.weapon.localeCompare(b.weapon))

const layerBRows = []
for (const entry of consensusEntries) {
  const build = entry.aliases.map((alias) => solvedByWeapon.get(alias)).find(Boolean)
  if (!build) continue

  const recommended = entry.consensus.variants.Recommended
  const consensusLayerB = recommended.attachments
    .filter((attachment) => !['Muzzle', 'Barrel', 'Underbarrel'].includes(attachment.slotType))
    .map((attachment) => attachment.name)
  const solvedLayerB = build.attachments.filter((attachment) => attachment.layer === 'B').map((attachment) => attachment.name.en)
  const matched = consensusLayerB.filter((attachment) => solvedLayerB.includes(attachment))

  layerBRows.push({
    weapon: build.weaponName,
    consensusLayerB: consensusLayerB.join(' + ') || 'None',
    solvedLayerB: solvedLayerB.join(' + ') || 'None',
    matched: `${matched.length}/${consensusLayerB.length}`,
  })
}

const flaggedTierDisagreements = tierDisagreements.filter((row) => row.distance > 1)

const lines = [
  '# BF6 Bible Calibration Report',
  '',
  'Generated from battlefieldmeta.gg consensus builds, current solved builds, and metaEngine `all` ranking.',
  'Consensus tier `META` is compared as the S/S+ public-meta band; distance <= 1 is accepted.',
  '',
  '## Summary',
  '',
  `- Outliers: ${outliers.length}`,
  `- Tier disagreement flags: ${flaggedTierDisagreements.length}`,
  `- Tier warnings: ${tierDisagreements.length - flaggedTierDisagreements.length}`,
  `- Consensus under-spend top-ups: ${capRows.length}`,
  `- Layer B comparison rows: ${layerBRows.length}`,
  '',
  '### Outliers (priority 1)',
  '',
  markdownTable(
    ['Weapon', 'Archetype', 'Score', 'Points', 'Issue', 'Build', 'Suspicion'],
    rowLimit(outliers).map(
      (row) =>
        `| ${sanitize(row.weapon)} | ${row.archetype} | ${row.score} | ${row.points} | ${row.issue} | ${sanitize(row.build)} | ${row.suspicion} |`,
    ),
  ),
  '',
  '### Tier disagreement',
  '',
  markdownTable(
    ['Weapon', 'Calculated', 'Consensus', 'Distance', 'Severity', 'Score'],
    rowLimit(tierDisagreements).map(
      (row) =>
        `| ${sanitize(row.weapon)} | ${row.calculatedTier} | ${row.consensus} | ${row.distance} | ${row.severity} | ${row.score} |`,
    ),
  ),
  '',
  '### Consensus under-spend top-ups',
  '',
  markdownTable(
    ['Weapon', 'Consensus spent', 'Our solved cap', 'Top-up'],
    rowLimit(capRows).map((row) => `| ${sanitize(row.weapon)} | ${row.consensus} | ${row.ours} | +${row.topUp} |`),
  ),
  '',
  '### Layer B literal consensus check',
  '',
  markdownTable(
    ['Weapon', 'Consensus Layer B', 'Solved Layer B', 'Matched'],
    rowLimit(layerBRows).map(
      (row) => `| ${sanitize(row.weapon)} | ${sanitize(row.consensusLayerB)} | ${sanitize(row.solvedLayerB)} | ${row.matched} |`,
    ),
  ),
  '',
]

const report = lines.join('\n')
await mkdir(dirname(OUTPUT_PATH), { recursive: true })
await writeFile(OUTPUT_PATH, report, 'utf8')
console.log(report)
