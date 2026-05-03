import { describe, expect, it } from 'vitest'
import { metaWeapons } from '../data'
import { metaScenarios, rankWeapons, type MetaScenarioId, type RankedWeapon } from '../metaEngine'

function serializeRankedWeapon(ranked: RankedWeapon, index: number) {
  return {
    rank: index + 1,
    weapon: ranked.metric.weapon.name.en,
    className: ranked.metric.className.en,
    tier: ranked.calculatedTier,
    score: ranked.score,
    roleFit: ranked.roleFit,
    dataQuality: ranked.dataQuality,
    mpTtkMs: ranked.mpTtkMs ?? null,
    redsecTtkMs: ranked.redsecTtkMs ?? null,
  }
}

function serializeScenarioRanking(scenarioId: MetaScenarioId) {
  return rankWeapons(metaWeapons, scenarioId).map(serializeRankedWeapon)
}

describe('metaEngine ranking snapshots', () => {
  for (const scenario of metaScenarios) {
    it(`keeps the complete ${scenario.id} ranking stable`, () => {
      expect(serializeScenarioRanking(scenario.id)).toMatchSnapshot()
    })
  }
})
