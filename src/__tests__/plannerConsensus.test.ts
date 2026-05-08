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
})
