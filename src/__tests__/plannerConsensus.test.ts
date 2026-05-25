import { describe, expect, it } from 'vitest'
import { modePlans } from '../data'
import { consensusBuilds } from '../generated/consensusBuilds'

type ConsensusBuild = (typeof consensusBuilds.builds)[keyof typeof consensusBuilds.builds]

const consensusByWeapon = consensusBuilds.builds as Record<string, ConsensusBuild>

const plannerWeaponUsages = () =>
  Object.values(modePlans).flatMap((mode) =>
    mode.roles.flatMap((role) =>
      role.loadouts.flatMap((loadout) => [
        {
          modeId: mode.id,
          roleId: role.id,
          loadoutId: loadout.id,
          slot: 'primary' as const,
          weaponName: loadout.primary.metric.weapon.name.en,
          className: loadout.primary.metric.className.en,
        },
        {
          modeId: mode.id,
          roleId: role.id,
          loadoutId: loadout.id,
          slot: 'secondary' as const,
          weaponName: loadout.secondary.metric.weapon.name.en,
          className: loadout.secondary.metric.className.en,
        },
      ]),
    ),
  )

describe('planner consensus guardrails', () => {
  it('does not recommend SCW-10 while category consensus ranks it outside the top close-range SMGs', () => {
    const scwConsensus = consensusByWeapon['SCW-10']

    expect(scwConsensus.categoryRank.category).toBe('Close Range')
    expect(scwConsensus.categoryRank.position).toBeGreaterThan(3)

    const scwUsages = plannerWeaponUsages().filter((usage) => usage.weaponName === 'SCW-10')
    expect(scwUsages).toEqual([])
  })

  it('keeps planner SMG picks inside the public top-three close-range consensus', () => {
    const smgUsages = plannerWeaponUsages().filter((usage) => usage.className === 'SMG')

    expect(smgUsages.length).toBeGreaterThan(0)

    for (const usage of smgUsages) {
      const consensus = consensusByWeapon[usage.weaponName]
      expect(
        consensus?.categoryRank.category,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}/${usage.slot}: ${usage.weaponName} is not a close-range consensus weapon`,
      ).toBe('Close Range')
      expect(
        consensus.categoryRank.position,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}/${usage.slot}: ${usage.weaponName} is outside public top-three close-range consensus`,
      ).toBeLessThanOrEqual(3)
    }
  })

  it('keeps Support LMG planner picks inside the public top-two META LMG pool', () => {
    const supportLmgUsages = plannerWeaponUsages().filter(
      (usage) => usage.className === 'LMG' && usage.slot === 'primary',
    )

    expect(supportLmgUsages.length).toBeGreaterThan(0)

    for (const usage of supportLmgUsages) {
      const consensus = consensusByWeapon[usage.weaponName]
      expect(
        consensus?.tier,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is not public META`,
      ).toBe('META')
      expect(
        consensus.categoryRank.position,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is outside the public top-two LMG pool`,
      ).toBeLessThanOrEqual(2)
    }
  })

  it('uses the public top DMR when Planner recommends a DMR primary', () => {
    const dmrUsages = plannerWeaponUsages().filter(
      (usage) => usage.className === 'DMR' && usage.slot === 'primary',
    )

    expect(dmrUsages.length).toBeGreaterThan(0)

    for (const usage of dmrUsages) {
      const consensus = consensusByWeapon[usage.weaponName]
      const weaponTypeRank =
        'rankingConsensus' in consensus && 'weaponTypeRank' in consensus.rankingConsensus
          ? consensus.rankingConsensus.weaponTypeRank.position
          : consensus.categoryRank.position

      expect(
        consensus.categoryRank.category,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is not a long-range consensus weapon`,
      ).toBe('Long Range')
      expect(
        weaponTypeRank,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is not the public top DMR`,
      ).toBe(1)
    }
  })

  it('uses the public META sniper when Planner recommends a sniper primary', () => {
    const sniperUsages = plannerWeaponUsages().filter(
      (usage) => usage.className === 'Sniper' && usage.slot === 'primary',
    )

    expect(sniperUsages.length).toBeGreaterThan(0)

    for (const usage of sniperUsages) {
      const consensus = consensusByWeapon[usage.weaponName]
      const weaponTypeRank =
        'rankingConsensus' in consensus && 'weaponTypeRank' in consensus.rankingConsensus
          ? consensus.rankingConsensus.weaponTypeRank.position
          : consensus.categoryRank.position

      expect(
        consensus.tier,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is not public META`,
      ).toBe('META')
      expect(
        weaponTypeRank,
        `${usage.modeId}/${usage.roleId}/${usage.loadoutId}: ${usage.weaponName} is not the public top sniper`,
      ).toBe(1)
    }
  })
})
