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
    categoryTier: ranked.categoryTier,
    categoryRank: ranked.categoryRank,
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
    let comparableSnipers = 0

    for (const stat of sniperStats) {
      const bodyScore = metaEngineTestHooks.bodyKillSpeedScore(stat)
      if (bodyScore === undefined) continue
      comparableSnipers += 1
      expect(metaEngineTestHooks.headshotPickScore(stat)).toBeGreaterThan(bodyScore ?? 0)
    }

    expect(comparableSnipers, 'expected at least one sniper with calculable body kill speed').toBeGreaterThan(0)
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

  it('assigns category tier and category rank to every weapon', () => {
    const ranking = rankWeapons(metaWeapons, 'all')
    for (const ranked of ranking) {
      expect(ranked.categoryTier, `${ranked.metric.weapon.name.en} missing categoryTier`).toMatch(/^(S|A|B|C|D)$/)
      expect(ranked.categoryRank.position, `${ranked.metric.weapon.name.en} missing categoryRank position`).toBeGreaterThanOrEqual(1)
      expect(ranked.categoryRank.total, `${ranked.metric.weapon.name.en} missing categoryRank total`).toBeGreaterThanOrEqual(1)
    }
  })

  it('sets the top weapon in each category to S categoryTier', () => {
    const ranking = rankWeapons(metaWeapons, 'all')
    const byCategory = new Map<string, RankedWeapon[]>()
    for (const ranked of ranking) {
      const category = ranked.metric.className.en
      if (!byCategory.has(category)) byCategory.set(category, [])
      byCategory.get(category)!.push(ranked)
    }

    for (const [category, members] of byCategory) {
      const top = [...members].sort((a, b) => b.score - a.score)[0]
      expect(
        top.categoryTier,
        `top of ${category} (${top.metric.weapon.name.en}) should be S, got ${top.categoryTier}`,
      ).toBe('S')
    }
  })

  it('sets M39 EMR to S inside the DMR category in the all scenario', () => {
    const ranking = rankWeapons(metaWeapons, 'all')
    const m39 = ranking.find((ranked) => ranked.metric.weapon.name.en === 'M39 EMR')
    expect(m39?.categoryTier).toBe('S')
  })

  it('does not promote SCW-10 above the public META SMGs', () => {
    const ranking = rankWeapons(metaWeapons, 'all')
    const smgs = ranking.filter((ranked) => ranked.metric.className.en === 'SMG')
    const scw = smgs.find((ranked) => ranked.metric.weapon.name.en === 'SCW-10')
    const publicMetaSmgs = ['SGX', 'USG-90', 'PW5A3']

    expect(scw, 'SCW-10 missing from SMG ranking').toBeDefined()
    expect(scw?.calculatedTier).toBe('A')
    expect(scw?.categoryRank.position, 'SCW-10 should not rank as a top-3 SMG after category-page consensus sync').toBeGreaterThan(3)

    for (const weaponName of publicMetaSmgs) {
      const publicMeta = smgs.find((ranked) => ranked.metric.weapon.name.en === weaponName)
      expect(publicMeta, `${weaponName} missing from SMG ranking`).toBeDefined()
      expect(
        publicMeta?.categoryRank.position ?? Number.POSITIVE_INFINITY,
        `${weaponName} should stay above SCW-10`,
      ).toBeLessThan(scw?.categoryRank.position ?? 0)
    }
  })
})
