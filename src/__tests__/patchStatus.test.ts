import { describe, expect, it } from 'vitest'
import { generatedPatchStatus } from '../generated/patchStatus'

describe('patch status dataset', () => {
  it('tracks the active official EA patch', () => {
    const patch = generatedPatchStatus.currentPatch

    expect(patch.version).toMatch(/^\d+\.\d+\.\d+\.\d+$/)
    expect(patch.sourceUrl).toContain('ea.com')
    expect(patch.effectiveAt).toBeTruthy()
    expect(new Date(patch.effectiveAt).toString()).not.toBe('Invalid Date')
  })

  it('classifies weapon meta separately from REDSEC flow', () => {
    const patch = generatedPatchStatus.currentPatch

    expect(patch.weaponBalanceChanged).toBe(false)
    expect(patch.rankingDecision.en).toContain('Weapon ranking unchanged')
    expect(patch.redsecFlowChanged).toBe(true)
  })

  it('keeps at least one official change section with meta signal tags', () => {
    const sections = generatedPatchStatus.currentPatch.sections

    expect(sections.length).toBeGreaterThan(0)
    for (const section of sections) {
      expect(section.items.length, `${section.id} has no parsed patch items`).toBeGreaterThan(0)
      for (const item of section.items) {
        expect(['high', 'medium', 'low']).toContain(item.metaSignal)
      }
    }
  })
})
