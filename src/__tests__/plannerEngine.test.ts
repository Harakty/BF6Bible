import { describe, expect, it } from 'vitest'
import { metaWeapons, modePlans } from '../data'
import { pickPlannerLoadoutPair, type PlannerRoleId, type PlannerVariantId } from '../plannerEngine'

const expectedProfileByLoadoutId: Record<string, { roleId: PlannerRoleId; variantId: PlannerVariantId }> = {
  'assault-kord': { roleId: 'assault-entry', variantId: 'default' },
  'assault-vcr': { roleId: 'assault-entry', variantId: 'alternative' },
  'support-kts': { roleId: 'support-anchor', variantId: 'default' },
  'support-rpk': { roleId: 'support-anchor', variantId: 'alternative' },
  'engineer-sg553': { roleId: 'engineer-av', variantId: 'default' },
  'engineer-sgx': { roleId: 'engineer-av', variantId: 'alternative' },
  'recon-m39': { roleId: 'recon-info', variantId: 'default' },
  'recon-sniper-smg': { roleId: 'recon-info', variantId: 'alternative' },
}

const uniquePlannerLoadouts = () => {
  const seen = new Set<string>()
  return Object.values(modePlans)
    .flatMap((mode) => mode.roles.flatMap((role) => role.loadouts))
    .filter((loadout) => {
      if (seen.has(loadout.id)) return false
      seen.add(loadout.id)
      return true
    })
}

describe('planner engine integration', () => {
  it('derives every Planner loadout weapon pair from the planner scoring engine', () => {
    for (const loadout of uniquePlannerLoadouts()) {
      const expected = expectedProfileByLoadoutId[loadout.id]
      expect(expected, `${loadout.id} missing planner profile mapping`).toBeDefined()

      const pair = pickPlannerLoadoutPair(metaWeapons, expected.roleId, expected.variantId)
      expect(loadout.primary.metric.weapon.name.en, `${loadout.id} primary drifted from Planner Score`).toBe(
        pair.primary.weaponName,
      )
      expect(loadout.secondary.metric.weapon.name.en, `${loadout.id} secondary drifted from Planner Score`).toBe(
        pair.secondary.weaponName,
      )
      expect(loadout.selectionScore, `${loadout.id} missing Planner Score`).toBe(pair.score)
      expect(loadout.selectionReason, `${loadout.id} missing planner rationale`).toEqual(pair.reason)
    }
  })

  it('uses the public top LMG as the Support default', () => {
    const supportDefault = modePlans.quads.roles
      .find((role) => role.id === 'support-anchor')
      ?.loadouts.find((loadout) => loadout.id === 'support-kts')

    expect(supportDefault?.primary.metric.weapon.name.en).toBe('KTS100 MK8')
    expect(supportDefault?.selectionReason?.en).toContain('category ranks 1/10')
  })
})
