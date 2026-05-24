import { describe, expect, it } from 'vitest'
import { consensusBuilds } from '../generated/consensusBuilds'
import { generatedChaseBuilds } from '../generated/chaseBuilds'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'
import { normalizeWeaponName } from '../weaponStats'

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

  it('alternativeVariants in solvedBuilds matches consensus variants plus Chase REDSEC when available', () => {
    for (const build of generatedSolvedBuilds.builds) {
      const consensus = consensusBuilds.builds[build.consensusWeaponName]
      const hasChaseVariant = Object.values(generatedChaseBuilds.builds).some(
        (chaseBuild) => normalizeWeaponName(chaseBuild.weaponName) === normalizeWeaponName(build.weaponName),
      )
      const expectedAltCount = Object.keys(consensus.variants).length - 1 + (hasChaseVariant ? 1 : 0)
      expect(build.alternativeVariants.length, `${build.weaponName}: alternative variant count mismatch`).toBe(expectedAltCount)
    }
  })

  it('adds the Chase REDSEC variant for weapons covered by Chasenoface', () => {
    for (const weaponName of Object.keys(generatedChaseBuilds.builds)) {
      const solved = generatedSolvedBuilds.builds.find(
        (build) => normalizeWeaponName(build.weaponName) === normalizeWeaponName(weaponName),
      )
      if (!solved) continue

      expect(
        solved.alternativeVariants.some((variant) => variant.variantId === 'chasenoface-redsec'),
        `${weaponName}: missing Chase REDSEC variant`,
      ).toBe(true)
    }
  })
})
