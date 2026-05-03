import { describe, expect, it } from 'vitest'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'

const buildSlots = ['muzzle', 'barrel', 'underbarrel', 'laser'] as const

function buildSignature(build: (typeof generatedSolvedBuilds.builds)[number]) {
  const attachmentBySlot = new Map(build.attachments.map((attachment) => [attachment.slot, attachment.id]))
  return buildSlots.map((slot) => attachmentBySlot.get(slot) ?? 'none').join('|')
}

describe('solvedBuilds archetype discrimination', () => {
  it('keeps solver output from collapsing to one build per archetype', () => {
    const buildsByArchetype = new Map<string, Array<(typeof generatedSolvedBuilds.builds)[number]>>()

    for (const build of generatedSolvedBuilds.builds) {
      buildsByArchetype.set(build.archetype.id, [...(buildsByArchetype.get(build.archetype.id) ?? []), build])
    }

    for (const [archetype, builds] of buildsByArchetype) {
      if (builds.length < 4) continue

      const distinctBuilds = new Set(builds.map(buildSignature))
      const requiredDistinctBuilds = Math.max(2, Math.ceil(builds.length / 4))

      console.info(`${archetype}: ${builds.length} weapons, ${distinctBuilds.size} distinct builds OK`)
      // This should fail if solver tuning collapses output; tune scarcity/cost pressure instead of relaxing the bound.
      expect(distinctBuilds.size, `${archetype} collapsed to ${distinctBuilds.size}/${requiredDistinctBuilds} builds`).toBeGreaterThanOrEqual(
        requiredDistinctBuilds,
      )
    }
  })
})
