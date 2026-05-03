import { describe, expect, it } from 'vitest'
import { metaWeapons } from '../data'
import { generatedSolvedBuilds } from '../generated/solvedBuilds'
import { rankWeapons } from '../metaEngine'
import { generateRationale } from '../rationaleEngine'
import { normalizeWeaponName } from '../weaponStats'

describe('rationaleEngine', () => {
  it('generates rationale with at least 3 concrete metrics for every weapon', () => {
    const ranking = rankWeapons(metaWeapons, 'all')

    for (const build of generatedSolvedBuilds.builds) {
      const position = ranking.findIndex((item) => normalizeWeaponName(item.metric.weapon.name.en) === normalizeWeaponName(build.weaponName))
      const ranked = position === -1 ? undefined : ranking[position]
      const text = generateRationale(build.weaponName, build, ranked, 'Generale', 'it', ranking.length, position + 1)
      const concreteSignals = [
        /Tier [SABCD+]+/,
        /\d+ms/,
        /\d+\/100/,
        /rank \d+\/\d+/,
        /cap \d+\/\d+/,
      ].filter((pattern) => pattern.test(text)).length

      expect(concreteSignals, `${build.weaponName}: rationale "${text}" lacks concrete metrics`).toBeGreaterThanOrEqual(3)
    }
  })
})
