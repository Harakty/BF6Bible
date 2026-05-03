import { describe, expect, it } from 'vitest'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'

function serializeSolvedBuild(build: (typeof generatedSolvedBuilds.builds)[number]) {
  return {
    weapon: build.weaponName,
    archetype: build.archetype.id,
    attachments: build.attachments.map((attachment) => attachment.name.en),
    totalPoints: build.totalPoints,
    objectiveScore: build.objectiveScore,
  }
}

describe('solvedBuilds generated output', () => {
  it('keeps solved builds stable', () => {
    expect(generatedSolvedBuilds.builds.map(serializeSolvedBuild)).toMatchSnapshot()
  })

  it('does not assign underbarrel attachments to sidearms without compatibility data', () => {
    const sidearmBuilds = generatedSolvedBuilds.builds.filter((build) => build.categoryKey === 'sidearm')

    for (const build of sidearmBuilds) {
      expect(build.attachments.map((attachment) => attachment.slot)).not.toContain('underbarrel')
    }
  })
})
