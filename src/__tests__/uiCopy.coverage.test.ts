import { describe, expect, it } from 'vitest'
import { archetypeUiCopy } from '../archetypeCopy'
import { effectUiCopy } from '../effectCopy'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'
import { weaponBuildRationale } from '../weaponBuildRationale'
import { metaWeapons } from '../data'

describe('UI copy coverage', () => {
  it('every archetype id used in solved builds has UI copy', () => {
    const archetypeIds = new Set(generatedSolvedBuilds.builds.map((build) => build.archetype.id))
    for (const id of archetypeIds) {
      expect(archetypeUiCopy[id], `archetype "${id}" missing UI copy`).toBeDefined()
    }
  })

  it('every effect key used in solved builds has UI copy', () => {
    const effectKeys = new Set(generatedSolvedBuilds.builds.flatMap((build) => Object.keys(build.effectTotals)))
    for (const key of effectKeys) {
      expect(effectUiCopy[key], `effect "${key}" missing UI copy`).toBeDefined()
    }
  })

  it('every weapon in metaWeapons has a build rationale entry', () => {
    for (const weapon of metaWeapons) {
      expect(
        weaponBuildRationale[weapon.weapon.name.en],
        `weapon "${weapon.weapon.name.en}" missing rationale`,
      ).toBeDefined()
    }
  })
})
