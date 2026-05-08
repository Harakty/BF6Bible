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
      for (const [variantName, variant] of Object.entries(build.variants)) {
        const sum = variant.attachments.reduce((total: number, attachment: { pointCost: number }) => total + attachment.pointCost, 0)
        expect(sum, `${name} ${variantName}: attachment sum ${sum} != totalPoints ${variant.totalPoints}`).toBe(variant.totalPoints)
        expect(variant.totalPoints, `${name} ${variantName}: totalPoints exceeds weaponMaxBudget`).toBeLessThanOrEqual(
          build.weaponMaxBudget,
        )
      }
      expect(build.weaponMaxBudget, `${name}: weaponMaxBudget exceeds BF6 budget`).toBeLessThanOrEqual(100)
    }
  })

  it('every consensus build has weaponMaxBudget defined', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      expect(build.weaponMaxBudget, `${name} missing weaponMaxBudget`).toBeGreaterThan(0)
      expect(build.variants.Recommended, `${name} missing Recommended variant`).toBeDefined()
      expect(build.variants.Recommended.totalPoints, `${name} missing Recommended totalPoints`).toBeGreaterThan(0)
      expect(build.variants.Recommended.totalPoints, `${name} Recommended exceeds cap`).toBeLessThanOrEqual(build.weaponMaxBudget)
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
      for (const [variantName, variant] of Object.entries(build.variants)) {
        for (const attachment of variant.attachments) {
          expect(attachment.sourceUrl, `${name} ${variantName}: ${attachment.name} missing sourceUrl`).toBe(build.sourceUrl)
          expect(attachment.fetchTimestamp, `${name} ${variantName}: ${attachment.name} missing fetchTimestamp`).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          )
        }
      }
    }
  })

  it('no sniper consensus build includes a laser', () => {
    const snipers = metaWeapons.filter((weapon) => weapon.className.en === 'Sniper Rifle')

    for (const sniper of snipers) {
      const build = consensusByWeapon[sniper.weapon.name.en]
      const hasLaser = Object.values(build.variants).some((variant) =>
        variant.attachments.some((attachment: { name: string }) => /laser|MW (RED|GREEN|BLUE)/i.test(attachment.name)),
      )
      expect(hasLaser, `${sniper.weapon.name.en} consensus has a laser`).toBe(false)
    }
  })

  it('every weapon with imageUrl also has imagePath populated', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      if ('imageUrl' in build && build.imageUrl) {
        expect('imagePath' in build ? build.imagePath : undefined, `${name}: has imageUrl but missing imagePath`).toBeDefined()
      }
    }
  })

  it('covers at least 50 weapon images', () => {
    const withImage = Object.values(consensusBuilds.builds).filter((build) => 'imagePath' in build && build.imagePath).length
    expect(withImage).toBeGreaterThanOrEqual(50)
  })

  it('uses category ranking pages as the authoritative public tier source', () => {
    for (const [name, build] of Object.entries(consensusBuilds.builds)) {
      expect('rankingSourceUrl' in build ? build.rankingSourceUrl : undefined, `${name} missing ranking source URL`).toMatch(
        /^https:\/\/battlefieldmeta\.gg\/best-guns\//,
      )
      expect('loadoutTier' in build ? build.loadoutTier : undefined, `${name} missing loadout tier audit field`).toBeDefined()
      expect('loadoutCategoryRank' in build ? build.loadoutCategoryRank : undefined, `${name} missing loadout rank audit field`).toBeDefined()
      expect('rankingConsensus' in build ? build.rankingConsensus.categoryRank.position : 0, `${name} missing ranking category position`).toBeGreaterThan(0)
    }
  })

  it('keeps the SCW-10 stale loadout ranking from overriding the category ranking', () => {
    const scw = consensusByWeapon['SCW-10']

    expect(scw.tier).toBe('A')
    expect(scw.categoryRank).toEqual({ position: 8, category: 'Close Range' })
    expect('loadoutTier' in scw ? scw.loadoutTier : undefined).toBe('META')
    expect('rankingSourceUrl' in scw ? scw.rankingSourceUrl : '').toContain('/best-guns/best-smg-in-battlefield')
    expect('rankingConsensus' in scw ? scw.rankingConsensus.weaponTypeRank : undefined).toEqual({
      position: 8,
      category: 'SMG',
    })
  })
})
