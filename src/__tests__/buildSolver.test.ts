import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  archetypeProfiles,
  scarcityMultiplier,
  solveBuild,
  type ArchetypeProfile,
  type SolverAttachment,
  type WeaponInputForSolver,
} from '../buildSolver'

const weapon: WeaponInputForSolver = {
  weaponId: 'TEST',
  control: 60,
  adsMs: 280,
}

const recoilOnly: ArchetypeProfile = {
  id: 'balanced',
  label: { it: 'Test', en: 'Test' },
  weights: { recoilControl: 1 },
  rationale: { it: 'Test', en: 'Test' },
}

const attachments: SolverAttachment[] = [
  { id: 'MUZZLE_LOW', name: 'Muzzle Low', slot: 'muzzle', pointCost: 10, effects: { recoilControl: 2 } },
  { id: 'MUZZLE_HIGH', name: 'Muzzle High', slot: 'muzzle', pointCost: 80, effects: { recoilControl: 6 } },
  { id: 'UNDERBARREL', name: 'Underbarrel', slot: 'underbarrel', pointCost: 30, effects: { recoilControl: 5 } },
  { id: 'LASER', name: 'Laser', slot: 'laser', pointCost: 10, effects: { hipfire: 10 } },
]

describe('build solver', () => {
  it('keeps total points within budget and one attachment per slot', () => {
    const solved = solveBuild(weapon, archetypeProfiles['mid-control'], attachments)
    const seenSlots = new Set(solved.attachments.map((attachment) => attachment.slot))

    expect(solved.totalPoints).toBeLessThanOrEqual(100)
    expect(seenSlots.size).toBe(solved.attachments.length)
  })

  it('keeps objectiveScore in the 0-100 range', () => {
    const solved = solveBuild(weapon, archetypeProfiles['mid-control'], attachments)

    expect(solved.objectiveScore).toBeGreaterThanOrEqual(0)
    expect(solved.objectiveScore).toBeLessThanOrEqual(100)
  })

  it('is deterministic for identical input', () => {
    const first = solveBuild(weapon, archetypeProfiles['mid-control'], attachments)
    const second = solveBuild(weapon, archetypeProfiles['mid-control'], attachments)

    expect(second).toEqual(first)
  })

  it('does not use Math.random in buildSolver.ts', () => {
    expect(readFileSync(join(process.cwd(), 'src/buildSolver.ts'), 'utf8')).not.toContain('Math.random')
  })

  it('maximizes recoilControl for a recoil-only archetype within budget', () => {
    const solved = solveBuild(weapon, recoilOnly, attachments)

    expect(solved.attachments.map((attachment) => attachment.id).sort()).toEqual(['MUZZLE_LOW', 'UNDERBARREL'])
    expect(solved.effectTotals.recoilControl).toBe(7)
  })

  it('returns an empty zero-score build when no attachments are available', () => {
    const solved = solveBuild(weapon, archetypeProfiles['mid-control'], [])

    expect(solved.attachments).toEqual([])
    expect(solved.totalPoints).toBe(0)
    expect(solved.objectiveScore).toBe(0)
  })

  it('explains empty slots when budget is exhausted by stronger picks', () => {
    const solved = solveBuild(
      weapon,
      {
        id: 'balanced',
        label: { it: 'Budget', en: 'Budget' },
        weights: { recoilControl: 1, hipfire: 1 },
        rationale: { it: 'Budget', en: 'Budget' },
      },
      [
        { id: 'CONTROL', name: 'Control', slot: 'muzzle', pointCost: 50, effects: { recoilControl: 11 } },
        { id: 'LASER', name: 'Laser', slot: 'laser', pointCost: 10, effects: { hipfire: 10 } },
      ],
      50,
    )
    const laserReason = solved.rationaleData.chosenJustification.find((item) => item.attachmentId === 'NO_LASER')?.reason

    expect(solved.attachments.map((attachment) => attachment.id)).toEqual(['CONTROL'])
    expect(laserReason).toContain('budget exhausted')
  })
})

describe('scarcity multiplier', () => {
  it('boosts recoil effects when control is low', () => {
    expect(scarcityMultiplier({ weaponId: 'LOW', control: 30 }, 'recoilControl')).toBe(1.3)
  })

  it('discounts recoil effects when control is high', () => {
    expect(scarcityMultiplier({ weaponId: 'HIGH', control: 85 }, 'recoilControl')).toBe(0.7)
  })

  it('keeps recoil effects neutral at medium control', () => {
    expect(scarcityMultiplier({ weaponId: 'MID', control: 60 }, 'recoilControl')).toBe(1)
  })

  it('boosts ADS effects when ADS is slow', () => {
    expect(scarcityMultiplier({ weaponId: 'SLOW', adsMs: 340 }, 'adsTimeTier')).toBe(1.3)
  })

  it('discounts ADS effects when ADS is fast', () => {
    expect(scarcityMultiplier({ weaponId: 'FAST', adsMs: 240 }, 'adsTimeTier')).toBe(0.7)
  })

  it('keeps ADS effects neutral at medium ADS speed', () => {
    expect(scarcityMultiplier({ weaponId: 'MID', adsMs: 280 }, 'adsTimeTier')).toBe(1)
  })
})
