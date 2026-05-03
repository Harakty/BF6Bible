import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SNAPSHOT_PATH = 'src/__tests__/__snapshots__/metaEngine.snapshot.test.ts.snap'
const snapshotPath = resolve(SNAPSHOT_PATH)

function readBaselineSnapshot() {
  try {
    return execFileSync('git', ['show', `HEAD:${SNAPSHOT_PATH}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

function snapshotsChanged() {
  try {
    execFileSync('git', ['diff', '--quiet', '--', SNAPSHOT_PATH], { stdio: 'ignore' })
    return false
  } catch {
    return true
  }
}

function parseSnapshot(text) {
  const scenarios = new Map()
  const scenarioRegex =
    /exports\[`metaEngine ranking snapshots > keeps the complete ([^`]+) ranking stable 1`\] = `\n([\s\S]*?)\n`/g

  for (const scenarioMatch of text.matchAll(scenarioRegex)) {
    const scenarioId = scenarioMatch[1]
    const scenarioBody = scenarioMatch[2]
    const weapons = new Map()
    const objectRegex = /\{\n([\s\S]*?)\n  \}/g

    for (const objectMatch of scenarioBody.matchAll(objectRegex)) {
      const block = objectMatch[1]
      const weapon = /"weapon": "([^"]+)"/.exec(block)?.[1]
      const rank = Number(/"rank": (\d+)/.exec(block)?.[1])
      const tier = /"tier": "([^"]+)"/.exec(block)?.[1]
      const score = Number(/"score": (\d+)/.exec(block)?.[1])
      if (!weapon || !rank || !tier || !Number.isFinite(score)) continue
      weapons.set(weapon, { rank, tier, score })
    }

    scenarios.set(scenarioId, weapons)
  }

  return scenarios
}

function formatMovement(before, after) {
  const rank = before.rank === after.rank ? String(after.rank) : `${before.rank} -> ${after.rank}`
  const tier = before.tier === after.tier ? after.tier : `${before.tier} -> ${after.tier}`
  const score = before.score === after.score ? String(after.score) : `${before.score} -> ${after.score}`
  return {
    rank,
    tier,
    score,
    deltaRank: before.rank - after.rank,
    deltaScore: after.score - before.score,
  }
}

const before = parseSnapshot(readBaselineSnapshot())
const after = parseSnapshot(readFileSync(snapshotPath, 'utf8'))
const rows = []

for (const [scenarioId, afterWeapons] of after) {
  const beforeWeapons = before.get(scenarioId) ?? new Map()

  for (const [weapon, current] of afterWeapons) {
    const previous = beforeWeapons.get(weapon)
    if (!previous) {
      rows.push({
        scenarioId,
        weapon,
        rank: `new -> ${current.rank}`,
        tier: `new -> ${current.tier}`,
        score: `new -> ${current.score}`,
        deltaRank: 999,
        deltaScore: current.score,
      })
      continue
    }

    if (previous.rank === current.rank && previous.tier === current.tier && previous.score === current.score) continue
    rows.push({ scenarioId, weapon, ...formatMovement(previous, current) })
  }

  for (const [weapon, previous] of beforeWeapons) {
    if (afterWeapons.has(weapon)) continue
    rows.push({
      scenarioId,
      weapon,
      rank: `${previous.rank} -> removed`,
      tier: `${previous.tier} -> none`,
      score: `${previous.score} -> none`,
      deltaRank: -999,
      deltaScore: -previous.score,
    })
  }
}

if (rows.length === 0) {
  if (snapshotsChanged()) {
    console.error('Snapshot format may have changed, parser stale.')
    process.exit(1)
  }

  console.log('No ranking shifts detected.')
  process.exit(0)
}

rows.sort((a, b) => Math.abs(b.deltaScore) - Math.abs(a.deltaScore) || Math.abs(b.deltaRank) - Math.abs(a.deltaRank))

console.log('# Ranking shifts detected')
console.log('')
console.log('Generated snapshots changed after the automated data refresh. Review these movements before deploying the updated meta.')
console.log('')
console.log('| Scenario | Weapon | Rank | Tier | Score |')
console.log('| --- | --- | ---: | --- | ---: |')

for (const row of rows.slice(0, 80)) {
  console.log(`| ${row.scenarioId} | ${row.weapon} | ${row.rank} | ${row.tier} | ${row.score} |`)
}

if (rows.length > 80) {
  console.log('')
  console.log(`_Showing 80 of ${rows.length} changed rows._`)
}
