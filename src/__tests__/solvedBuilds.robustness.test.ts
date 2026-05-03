import { describe, expect, it } from 'vitest'
import { metaWeapons } from '../data'
import { externalMetaConsensus } from '../generated/externalMetaConsensus'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'
import { rankWeapons } from '../metaEngine'

const tierOrder = ['D', 'C', 'B', 'A', 'S', 'S+']

function tierDistance(a: string, b: string) {
  return Math.abs(tierOrder.indexOf(a) - tierOrder.indexOf(b))
}

describe('solvedBuilds robustness', () => {
  it('produces non-degenerate builds for every non-backup weapon', () => {
    for (const build of generatedSolvedBuilds.builds) {
      if (build.archetype.id === 'emergency-backup') continue
      expect(build.objectiveScore, `${build.weaponName} score too low`).toBeGreaterThanOrEqual(30)
      expect(build.totalPoints, `${build.weaponName} underspent`).toBeGreaterThanOrEqual(25)
      expect(build.attachments.length, `${build.weaponName} too sparse`).toBeGreaterThanOrEqual(3)
    }
  })

  it('keeps mean objectiveScore across non-backup builds healthy', () => {
    const nonBackup = generatedSolvedBuilds.builds.filter((build) => build.archetype.id !== 'emergency-backup')
    const meanScore = nonBackup.reduce((sum, build) => sum + build.objectiveScore, 0) / nonBackup.length

    expect(meanScore, 'mean objectiveScore degraded').toBeGreaterThanOrEqual(70)
  })

  it('respects consensus tier alignment in the curated tier layer for high-confidence weapons', () => {
    const rankedByWeapon = new Map(rankWeapons(metaWeapons, 'all').map((ranked) => [ranked.metric.weapon.name.en, ranked]))
    const highConfidenceConsensus = externalMetaConsensus.filter((entry) => entry.confidence === 'high' && entry.consensusTier)

    for (const entry of highConfidenceConsensus) {
      const ranked = rankedByWeapon.get(entry.weaponName)
      expect(ranked, `${entry.weaponName} missing from meta ranking`).toBeDefined()
      if (!ranked || !entry.consensusTier) continue

      expect(
        tierDistance(ranked.metric.tier, entry.consensusTier),
        `${entry.weaponName} curated tier ${ranked.metric.tier} too far from consensus ${entry.consensusTier}`,
      ).toBeLessThanOrEqual(1)
    }
  })
})
