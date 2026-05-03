import { describe, expect, it } from 'vitest'
import { metaWeapons } from '../data'
import { consensusBuilds } from '../generated/consensusBuilds'

const consensusByWeapon = consensusBuilds.builds as Record<string, (typeof consensusBuilds.builds)[keyof typeof consensusBuilds.builds]>

describe('consensus builds dataset', () => {
  it('covers all weapons in metaWeapons', () => {
    for (const weapon of metaWeapons) {
      const name = weapon.weapon.name.en
      expect(consensusByWeapon[name], `missing consensus for ${name}`).toBeDefined()
    }
  })

  it('every consensus build matches the budget declared by battlefieldmeta.gg', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      const sum = build.attachments.reduce((total, attachment) => total + attachment.pointCost, 0)
      expect(sum, `${name}: attachment sum ${sum} != parsed total ${build.totalPoints}`).toBe(build.totalPoints)
      expect(build.totalPoints, `${name}: parsed total exceeds source cap`).toBeLessThanOrEqual(build.budgetCap)
      expect(build.budgetCap, `${name}: source cap exceeds BF6 budget`).toBeLessThanOrEqual(100)
    }
  })

  it('tracks source provenance on every consensus attachment', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      for (const attachment of build.attachments) {
        expect(attachment.sourceUrl, `${name}: ${attachment.name} missing sourceUrl`).toBe(build.sourceUrl)
        expect(attachment.fetchTimestamp, `${name}: ${attachment.name} missing fetchTimestamp`).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        )
      }
    }
  })

  it('no sniper consensus build includes a laser', () => {
    const snipers = metaWeapons.filter((weapon) => weapon.className.en === 'Sniper Rifle')

    for (const sniper of snipers) {
      const build = consensusByWeapon[sniper.weapon.name.en]
      const hasLaser = build.attachments.some((attachment) => /laser|MW (RED|GREEN|BLUE)/i.test(attachment.name))
      expect(hasLaser, `${sniper.weapon.name.en} consensus has a laser`).toBe(false)
    }
  })
})
