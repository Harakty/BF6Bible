import { describe, expect, it } from 'vitest'
import { generatedChaseBuilds } from '../generated/chaseBuilds'
import { normalizeWeaponName } from '../weaponStats'

const chaseBuilds = Object.values(generatedChaseBuilds.builds)

describe('Chasenoface REDSEC build dataset', () => {
  it('covers the majority of the current REDSEC weapon pool', () => {
    expect(generatedChaseBuilds.buildCount).toBeGreaterThanOrEqual(45)
    expect(chaseBuilds.length).toBe(generatedChaseBuilds.buildCount)
  })

  it('includes the Planner control weapons', () => {
    const covered = new Set(chaseBuilds.map((build) => normalizeWeaponName(build.weaponName)))
    const expected = ['KORD 6P67', 'SGX', 'AK-205', 'M39 EMR', 'M2010 ESR', 'RPK-74M', 'DRS-IAR']

    for (const weaponName of expected) {
      expect(covered.has(normalizeWeaponName(weaponName)), `${weaponName} missing from Chase source`).toBe(true)
    }
  })

  it('keeps unresolved point costs bounded and explicit', () => {
    expect(generatedChaseBuilds.unresolved.length).toBeLessThanOrEqual(6)

    for (const item of generatedChaseBuilds.unresolved) {
      expect(item.weaponName).toBeTruthy()
      expect(item.sourceName).toBeTruthy()
      expect(item.slot).toBeTruthy()
    }
  })

  it('normalizes every attachment with a slot, source column, and non-negative point cost', () => {
    for (const build of chaseBuilds) {
      for (const attachment of build.attachments) {
        expect(attachment.slot, `${build.weaponName}: ${attachment.name} missing slot`).toBeTruthy()
        expect(attachment.sourceColumn, `${build.weaponName}: ${attachment.name} missing source column`).toBeTruthy()
        expect(attachment.pointCost, `${build.weaponName}: ${attachment.name} negative cost`).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
