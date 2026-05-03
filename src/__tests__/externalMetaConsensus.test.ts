import { describe, expect, it } from 'vitest'
import { externalMetaConsensus } from '../generated/externalMetaConsensus'
import { generatedWeaponStats } from '../generated/weaponStats'

const weaponNames: Set<string> = new Set(generatedWeaponStats.weapons.map((weapon) => weapon.name))
const rankedConfidence = new Set(['high', 'medium'])

describe('externalMetaConsensus bootstrap', () => {
  it('references only weapons that exist in generatedWeaponStats', () => {
    for (const entry of externalMetaConsensus) {
      expect(weaponNames.has(entry.weaponName), `${entry.weaponName} is not in weaponStats`).toBe(true)
    }
  })

  it('does not assign a consensus tier below medium confidence', () => {
    for (const entry of externalMetaConsensus) {
      if (!entry.consensusTier) continue
      expect(rankedConfidence.has(entry.confidence), `${entry.weaponName} has tier with ${entry.confidence} confidence`).toBe(true)
    }
  })

  it('keeps suggested build point totals inside the game budget', () => {
    for (const entry of externalMetaConsensus) {
      if (!entry.suggestedBuild) continue
      expect(entry.suggestedBuild.totalPoints, `${entry.weaponName} suggested build total`).toBeGreaterThanOrEqual(0)
      expect(entry.suggestedBuild.totalPoints, `${entry.weaponName} suggested build total`).toBeLessThanOrEqual(100)
    }
  })
})
