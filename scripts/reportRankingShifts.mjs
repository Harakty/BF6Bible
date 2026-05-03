import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const RANKING_SNAPSHOT_PATH = 'src/__tests__/__snapshots__/metaEngine.snapshot.test.ts.snap'
const SOLVED_BUILDS_SNAPSHOT_PATH = 'src/__tests__/__snapshots__/solvedBuilds.snapshot.test.ts.snap'

function readBaselineSnapshot(path) {
  try {
    return execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

function snapshotsChanged() {
  try {
    execFileSync('git', ['diff', '--quiet', '--', 'src/__tests__/__snapshots__'], { stdio: 'ignore' })
    return false
  } catch {
    return true
  }
}

function readSnapshot(path) {
  try {
    return readFileSync(resolve(path), 'utf8')
  } catch {
    return ''
  }
}

function parseRankingSnapshot(text) {
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

function parseSolvedBuildsSnapshot(text) {
  const builds = new Map()
  const snapshotMatch = /exports\[`solvedBuilds generated output > keeps solved builds stable 1`\] = `\n([\s\S]*?)\n`/.exec(text)
  const snapshotBody = snapshotMatch?.[1]
  if (!snapshotBody) return builds

  const objectRegex = /\{\n([\s\S]*?)\n  \}/g
  for (const objectMatch of snapshotBody.matchAll(objectRegex)) {
    const block = objectMatch[1]
    const weapon = /"weapon": "([^"]+)"/.exec(block)?.[1]
    const archetype = /"archetype": "([^"]+)"/.exec(block)?.[1]
    const objectiveScore = Number(/"objectiveScore": (\d+)/.exec(block)?.[1])
    const totalPoints = Number(/"totalPoints": (\d+)/.exec(block)?.[1])
    const attachmentsBlock = /"attachments": \[\n([\s\S]*?)\n    \]/.exec(block)?.[1] ?? ''
    const attachments = Array.from(attachmentsBlock.matchAll(/"([^"]+)"/g)).map((match) => match[1])
    if (!weapon || !archetype || !Number.isFinite(objectiveScore) || !Number.isFinite(totalPoints)) continue
    builds.set(weapon, { archetype, objectiveScore, totalPoints, attachments })
  }

  return builds
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

function compareRankingSnapshots() {
  const before = parseRankingSnapshot(readBaselineSnapshot(RANKING_SNAPSHOT_PATH))
  const after = parseRankingSnapshot(readSnapshot(RANKING_SNAPSHOT_PATH))
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

  rows.sort((a, b) => Math.abs(b.deltaScore) - Math.abs(a.deltaScore) || Math.abs(b.deltaRank) - Math.abs(a.deltaRank))
  return rows
}

function compareSolvedBuildSnapshots() {
  const before = parseSolvedBuildsSnapshot(readBaselineSnapshot(SOLVED_BUILDS_SNAPSHOT_PATH))
  const after = parseSolvedBuildsSnapshot(readSnapshot(SOLVED_BUILDS_SNAPSHOT_PATH))
  const rows = []

  for (const [weapon, current] of after) {
    const previous = before.get(weapon)
    if (!previous) {
      rows.push({
        weapon,
        archetype: `new -> ${current.archetype}`,
        attachments: `new -> ${current.attachments.join(' + ')}`,
        points: `new -> ${current.totalPoints}`,
        objective: `new -> ${current.objectiveScore}`,
        deltaScore: current.objectiveScore,
        deltaChangedAttachments: current.attachments.length,
      })
      continue
    }

    const previousAttachments = previous.attachments.join(' + ')
    const currentAttachments = current.attachments.join(' + ')
    if (
      previous.archetype === current.archetype &&
      previousAttachments === currentAttachments &&
      previous.totalPoints === current.totalPoints &&
      previous.objectiveScore === current.objectiveScore
    ) {
      continue
    }

    rows.push({
      weapon,
      archetype: previous.archetype === current.archetype ? current.archetype : `${previous.archetype} -> ${current.archetype}`,
      attachments: previousAttachments === currentAttachments ? currentAttachments : `${previousAttachments || 'None'} -> ${currentAttachments || 'None'}`,
      points: previous.totalPoints === current.totalPoints ? String(current.totalPoints) : `${previous.totalPoints} -> ${current.totalPoints}`,
      objective:
        previous.objectiveScore === current.objectiveScore
          ? String(current.objectiveScore)
          : `${previous.objectiveScore} -> ${current.objectiveScore}`,
      deltaScore: current.objectiveScore - previous.objectiveScore,
      deltaChangedAttachments: attachmentDelta(previous.attachments, current.attachments),
    })
  }

  for (const [weapon, previous] of before) {
    if (after.has(weapon)) continue
    rows.push({
      weapon,
      archetype: `${previous.archetype} -> none`,
      attachments: `${previous.attachments.join(' + ') || 'None'} -> removed`,
      points: `${previous.totalPoints} -> none`,
      objective: `${previous.objectiveScore} -> none`,
      deltaScore: -previous.objectiveScore,
      deltaChangedAttachments: previous.attachments.length,
    })
  }

  rows.sort((a, b) => Math.abs(b.deltaScore) - Math.abs(a.deltaScore) || b.deltaChangedAttachments - a.deltaChangedAttachments)
  return rows
}

function attachmentDelta(before, after) {
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  const removed = before.filter((attachment) => !afterSet.has(attachment)).length
  const added = after.filter((attachment) => !beforeSet.has(attachment)).length
  return removed + added
}

const rankingRows = compareRankingSnapshots()
const buildRows = compareSolvedBuildSnapshots()

if (rankingRows.length === 0 && buildRows.length === 0) {
  if (snapshotsChanged()) {
    console.error('Snapshot format may have changed, parser stale.')
    process.exit(1)
  }

  console.log('No ranking shifts detected.')
  process.exit(0)
}

console.log('# Snapshot shifts detected')
console.log('')
console.log('Generated snapshots changed after the automated data refresh. Review these movements before deploying the updated meta or builds.')

if (rankingRows.length > 0) {
  console.log('')
  console.log('## Ranking shifts')
  console.log('')
  console.log('| Scenario | Weapon | Rank | Tier | Score |')
  console.log('| --- | --- | ---: | --- | ---: |')

  for (const row of rankingRows.slice(0, 80)) {
    console.log(`| ${row.scenarioId} | ${row.weapon} | ${row.rank} | ${row.tier} | ${row.score} |`)
  }

  if (rankingRows.length > 80) {
    console.log('')
    console.log(`_Showing 80 of ${rankingRows.length} ranking rows._`)
  }
}

if (buildRows.length > 0) {
  console.log('')
  console.log('## Solved build shifts')
  console.log('')
  console.log('| Weapon | Archetype | Attachments | Points | Objective |')
  console.log('| --- | --- | --- | ---: | ---: |')

  for (const row of buildRows.slice(0, 80)) {
    console.log(`| ${row.weapon} | ${row.archetype} | ${row.attachments} | ${row.points} | ${row.objective} |`)
  }

  if (buildRows.length > 80) {
    console.log('')
    console.log(`_Showing 80 of ${buildRows.length} solved build rows._`)
  }
}
