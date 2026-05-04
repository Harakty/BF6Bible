import { describe, expect, it } from 'vitest'
import { consensusBuilds } from '../generated/consensusBuilds'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'

describe('build variants', () => {
  it('every weapon has at least one variant (Recommended)', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      expect(Object.keys(build.variants).length, `${name}: no variants`).toBeGreaterThan(0)
      expect(build.variants.Recommended, `${name}: missing Recommended variant`).toBeDefined()
    }
  })

  it('every variant totals exactly the declared variant totalPoints', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      for (const [variantName, variant] of Object.entries(build.variants)) {
        const sum = variant.attachments.reduce((total: number, attachment: { pointCost: number }) => total + attachment.pointCost, 0)
        expect(sum, `${name} ${variantName}: ${sum} != totalPoints ${variant.totalPoints}`).toBe(variant.totalPoints)
      }
    }
  })

  it('alternativeVariants in solvedBuilds matches consensus variants minus Recommended', () => {
    for (const build of generatedSolvedBuilds.builds) {
      const consensus = consensusBuilds.builds[build.consensusWeaponName]
      const expectedAltCount = Object.keys(consensus.variants).length - 1
      expect(build.alternativeVariants.length, `${build.weaponName}: alternative variant count mismatch`).toBe(expectedAltCount)
    }
  })
})
