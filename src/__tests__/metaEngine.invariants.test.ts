import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { metaWeapons } from '../data'
import { consensusBuilds } from '../generated/consensusBuilds'
import { metaEngineTestHooks, metaScenarios, rankWeapons, type RankedWeapon } from '../metaEngine'
import { generatedWeaponStats, normalizeWeaponName } from '../weaponStats'
import { generatedStatForName } from '../weaponStats'

const tierOrder = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  S: 4,
  'S+': 5,
} as const

function tierDistance(a: string, b: string) {
  return Math.abs(tierOrder[a as keyof typeof tierOrder] - tierOrder[b as keyof typeof tierOrder])
}

function compactRanking(ranking: RankedWeapon[]) {
  return ranking.map((ranked) => ({
    weapon: ranked.metric.weapon.name.en,
    tier: ranked.calculatedTier,
    score: ranked.score,
    roleFit: ranked.roleFit,
    dataQuality: ranked.dataQuality,
  }))
}

function consensusComparableTier(tier: string) {
  return tier === 'META' ? 'S' : tier
}

function sourceSlug(sourceUrl: string) {
  return sourceUrl.split('/').filter(Boolean).at(-1)
}

describe('metaEngine invariants', () => {
  it('keeps every score in the 0-100 range', () => {
    for (const scenario of metaScenarios) {
      for (const ranked of rankWeapons(metaWeapons, scenario.id)) {
        expect(ranked.score).toBeGreaterThanOrEqual(0)
        expect(ranked.score).toBeLessThanOrEqual(100)

        for (const component of ranked.components) {
          expect(component.score).toBeGreaterThanOrEqual(0)
          expect(component.score).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('keeps tiers monotonic with score', () => {
    for (let scoreA = 0; scoreA <= 100; scoreA += 1) {
      for (let scoreB = 0; scoreB <= scoreA; scoreB += 1) {
        const tierA = metaEngineTestHooks.scoreToTier(scoreA)
        const tierB = metaEngineTestHooks.scoreToTier(scoreB)
        expect(tierOrder[tierA]).toBeGreaterThanOrEqual(tierOrder[tierB])
      }
    }
  })

  it('keeps each scenario weight sum at 1.0 +/- 0.001', () => {
    for (const scenario of metaScenarios) {
      const total = Object.values(scenario.weights).reduce((sum, weight) => sum + (weight ?? 0), 0)
      expect(Math.abs(total - 1)).toBeLessThanOrEqual(0.001)
    }
  })

  it('keeps ranking deterministic for the same input', () => {
    for (const scenario of metaScenarios) {
      const first = compactRanking(rankWeapons(metaWeapons, scenario.id))
      const second = compactRanking(rankWeapons(metaWeapons, scenario.id))
      expect(second).toEqual(first)
    }
  })

  it('does not use Math.random in the ranking or generation pipeline', () => {
    const paths = [
      'src/metaEngine.ts',
      'src/buildEngine.ts',
      'src/data.ts',
      'scripts/generateBuilds.mjs',
      'scripts/ingestAttachments.mjs',
      'scripts/ingestWeapons.mjs',
    ]

    for (const path of paths) {
      expect(readFileSync(join(process.cwd(), path), 'utf8')).not.toContain('Math.random')
    }
  })

  it('scores sniper headshot pick value above body-based kill speed', () => {
    const sniperStats = generatedWeaponStats.weapons.filter((weapon) => weapon.categoryKey === 'sniper')

    for (const stat of sniperStats) {
      const bodyScore = metaEngineTestHooks.bodyKillSpeedScore(stat)
      expect(bodyScore).toBeDefined()
      expect(metaEngineTestHooks.headshotPickScore(stat)).toBeGreaterThan(bodyScore ?? 0)
    }
  })

  it('sets dataQuality to 100 if and only if generated stats exist', () => {
    for (const metric of metaWeapons) {
      const stat = generatedStatForName(metric.weapon.name.en)
      const score = metaEngineTestHooks.dataQualityScore(metric, stat)
      expect(score === 100).toBe(Boolean(stat))
    }
  })

  it('keeps calculated tiers within 1 step of battlefieldmeta consensus in the all scenario', () => {
    const ranking = rankWeapons(metaWeapons, 'all')
    const rankedByWeapon = new Map(ranking.map((ranked) => [normalizeWeaponName(ranked.metric.weapon.name.en), ranked]))

    for (const [weaponName, consensus] of Object.entries(consensusBuilds.builds)) {
      const slug = sourceSlug(consensus.sourceUrl)
      const ranked = rankedByWeapon.get(normalizeWeaponName(weaponName)) ?? (slug ? rankedByWeapon.get(normalizeWeaponName(slug)) : undefined)

      expect(ranked, `${weaponName} missing from all ranking`).toBeDefined()
      if (!ranked) continue

      expect(
        tierDistance(ranked.calculatedTier, consensusComparableTier(consensus.tier)),
        `${weaponName}: calculatedTier ${ranked.calculatedTier} vs consensus ${consensus.tier}`,
      ).toBeLessThanOrEqual(1)
    }
  })
})
