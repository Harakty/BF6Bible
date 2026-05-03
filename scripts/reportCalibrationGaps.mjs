import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { metaWeapons } from '../src/data.ts'
import { externalMetaConsensus } from '../src/generated/externalMetaConsensus.ts'
import { generatedAttachmentData } from '../src/generated/attachmentData.ts'
import { generatedSolvedBuilds } from '../src/generated/solvedBuilds.ts'
import { rankWeapons } from '../src/metaEngine.ts'

const OUTPUT_PATH = resolve('output/calibration-report.md')
const tierOrder = ['D', 'C', 'B', 'A', 'S', 'S+']
const spendTargets = {
  high: { min: 70, max: 100 },
  medium: { min: 45, max: 85 },
  low: { min: 0, max: 45 },
}

function buildName(build) {
  return build.attachments.map((attachment) => attachment.name.en).join(' + ') || 'None'
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

const solvedByWeapon = new Map(generatedSolvedBuilds.builds.map((build) => [build.weaponName, build]))
const rankedByWeapon = new Map(rankWeapons(metaWeapons, 'all').map((ranked) => [ranked.metric.weapon.name.en, ranked]))
const attachmentNames = new Set(generatedAttachmentData.attachments.map((attachment) => attachment.name))

const outliers = []
for (const build of generatedSolvedBuilds.builds) {
  if (build.objectiveScore < 50) {
    outliers.push({
      priority: 1,
      weapon: build.weaponName,
      archetype: build.archetype.id,
      score: build.objectiveScore,
      points: build.totalPoints,
      build: buildName(build),
      issue: 'Score too low',
      suspicion: build.totalPoints < 30 ? 'cost pressure too high or scarcity collapse' : 'objective normalization too harsh',
    })
  }

  if (build.totalPoints < 30 && build.archetype.id !== 'emergency-backup') {
    outliers.push({
      priority: 2,
      weapon: build.weaponName,
      archetype: build.archetype.id,
      score: build.objectiveScore,
      points: build.totalPoints,
      build: buildName(build),
      issue: 'Underspent',
      suspicion: 'budget penalty dominates useful effects',
    })
  }

  if (build.attachments.length < 3 && build.archetype.id !== 'emergency-backup') {
    outliers.push({
      priority: 3,
      weapon: build.weaponName,
      archetype: build.archetype.id,
      score: build.objectiveScore,
      points: build.totalPoints,
      build: buildName(build),
      issue: 'Sparse',
      suspicion: 'slot utility collapsed below budget pressure',
    })
  }
}

outliers.sort((a, b) => a.priority - b.priority || a.score - b.score || a.points - b.points)

const tierDisagreements = []
for (const entry of externalMetaConsensus) {
  if (!entry.consensusTier || (entry.confidence !== 'high' && entry.confidence !== 'medium')) continue
  const ranked = rankedByWeapon.get(entry.weaponName)
  if (!ranked) continue
  const distance = tierDistance(ranked.calculatedTier, entry.consensusTier)
  if (distance === 0) continue

  tierDisagreements.push({
    weapon: entry.weaponName,
    confidence: entry.confidence,
    ours: ranked.calculatedTier,
    consensus: entry.consensusTier,
    distance,
    severity: severityForTierDistance(distance),
    score: ranked.score,
  })
}
tierDisagreements.sort((a, b) => b.distance - a.distance || b.score - a.score)

const spendDisagreements = []
for (const entry of externalMetaConsensus) {
  if (entry.confidence !== 'high' || !entry.spendTarget) continue
  const build = solvedByWeapon.get(entry.weaponName)
  if (!build) continue
  const target = spendTargets[entry.spendTarget]

  if (build.totalPoints < target.min) {
    spendDisagreements.push({
      weapon: entry.weaponName,
      confidence: entry.confidence,
      target: entry.spendTarget,
      points: build.totalPoints,
      issue: 'Underspent vs consensus',
      build: buildName(build),
    })
  }

  if (build.totalPoints > target.max) {
    spendDisagreements.push({
      weapon: entry.weaponName,
      confidence: entry.confidence,
      target: entry.spendTarget,
      points: build.totalPoints,
      issue: 'Overspent vs consensus',
      build: buildName(build),
    })
  }
}
spendDisagreements.sort((a, b) => a.points - b.points)

const attachmentDisagreements = []
for (const entry of externalMetaConsensus) {
  if (!entry.suggestedBuild) continue
  const build = solvedByWeapon.get(entry.weaponName)
  if (!build) continue
  const matchable = entry.suggestedBuild.attachments.filter((attachment) => attachmentNames.has(attachment))
  if (matchable.length === 0) continue
  const ours = build.attachments.map((attachment) => attachment.name.en)
  const matched = matchable.filter((attachment) => ours.includes(attachment))

  attachmentDisagreements.push({
    weapon: entry.weaponName,
    consensusMatchable: matchable.join(' + '),
    ours: ours.join(' + ') || 'None',
    matched: `${matched.length}/${matchable.length}`,
  })
}

const lines = [
  '# BF6 Bible Calibration Report',
  '',
  'Generated from static Sprint 3 consensus, current solved builds, and metaEngine `all` ranking.',
  '',
  '## Summary',
  '',
  `- Outliers: ${outliers.length}`,
  `- Tier disagreements: ${tierDisagreements.length}`,
  `- Spend disagreements: ${spendDisagreements.length}`,
  `- Attachment comparison rows: ${attachmentDisagreements.length}`,
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
    ['Weapon', 'Confidence', 'Ours', 'Consensus', 'Distance', 'Severity', 'Score'],
    rowLimit(tierDisagreements).map(
      (row) => `| ${sanitize(row.weapon)} | ${row.confidence} | ${row.ours} | ${row.consensus} | ${row.distance} | ${row.severity} | ${row.score} |`,
    ),
  ),
  '',
  '### Build spend disagreement',
  '',
  markdownTable(
    ['Weapon', 'Confidence', 'Target', 'Points', 'Issue', 'Build'],
    rowLimit(spendDisagreements).map(
      (row) => `| ${sanitize(row.weapon)} | ${row.confidence} | ${row.target} | ${row.points} | ${row.issue} | ${sanitize(row.build)} |`,
    ),
  ),
  '',
  '### Build attachment disagreement',
  '',
  markdownTable(
    ['Weapon', 'Consensus matchable attachments', 'Our solved build', 'Matched'],
    rowLimit(attachmentDisagreements).map(
      (row) => `| ${sanitize(row.weapon)} | ${sanitize(row.consensusMatchable)} | ${sanitize(row.ours)} | ${row.matched} |`,
    ),
  ),
  '',
]

const report = lines.join('\n')
await mkdir(dirname(OUTPUT_PATH), { recursive: true })
await writeFile(OUTPUT_PATH, report, 'utf8')
console.log(report)
