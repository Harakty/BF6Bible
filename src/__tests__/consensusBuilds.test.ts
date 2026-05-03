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
      expect(sum, `${name}: attachment sum ${sum} != consensusSpent ${build.consensusSpent}`).toBe(build.consensusSpent)
      expect(build.consensusSpent, `${name}: consensusSpent exceeds weaponMaxBudget`).toBeLessThanOrEqual(build.weaponMaxBudget)
      expect(build.weaponMaxBudget, `${name}: weaponMaxBudget exceeds BF6 budget`).toBeLessThanOrEqual(100)
    }
  })

  it('every consensus build has weaponMaxBudget defined', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      expect(build.weaponMaxBudget, `${name} missing weaponMaxBudget`).toBeGreaterThan(0)
      expect(build.consensusSpent, `${name} missing consensusSpent`).toBeGreaterThan(0)
      expect(build.consensusSpent, `${name} consensusSpent exceeds cap`).toBeLessThanOrEqual(build.weaponMaxBudget)
    }
  })

  it('weaponMaxBudget distribution matches expected sidearm caps', () => {
    const sidearmWeapons = metaWeapons.filter((weapon) => weapon.slot === 'secondary' || weapon.className.en === 'Pistol')

    for (const sidearm of sidearmWeapons) {
      const build = consensusByWeapon[sidearm.weapon.name.en]
      expect(build.weaponMaxBudget, `${sidearm.weapon.name.en} sidearm cap unexpected`).toBeLessThanOrEqual(70)
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
