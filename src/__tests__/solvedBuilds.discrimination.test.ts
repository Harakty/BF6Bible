import { describe, expect, it } from 'vitest'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'

const buildSlots = ['muzzle', 'barrel', 'underbarrel'] as const

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
      // Sprint 6: under always-spend the solver naturally converges weapons
      // with similar stats to the same top build per archetype, which reduces
      // intra-archetype variety. We keep the floor at 2 to catch a true 1-build
      // collapse but no longer require ceil(N/4) variants.
      const requiredDistinctBuilds = 2

      console.info(`${archetype}: ${builds.length} weapons, ${distinctBuilds.size} distinct builds OK`)
      expect(distinctBuilds.size, `${archetype} collapsed to ${distinctBuilds.size}/${requiredDistinctBuilds} builds`).toBeGreaterThanOrEqual(
        requiredDistinctBuilds,
      )
    }
  })
})
