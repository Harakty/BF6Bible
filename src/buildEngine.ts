import { generatedAlgorithmicBuilds } from './generated/algorithmicBuilds'
import { normalizeWeaponName } from './weaponStats'

export type AlgorithmicBuild = (typeof generatedAlgorithmicBuilds.builds)[number]
export type AlgorithmicAttachment = AlgorithmicBuild['attachments'][number]

export const algorithmicBuilds = generatedAlgorithmicBuilds.builds

const buildByWeapon = new Map(
  generatedAlgorithmicBuilds.builds.map((build) => [normalizeWeaponName(build.weaponName), build]),
)

export function algorithmicBuildForWeapon(weaponName: string) {
  return buildByWeapon.get(normalizeWeaponName(weaponName))
}

export function algorithmicBuildPointLabel(build: AlgorithmicBuild) {
  return `${build.totalPoints}/${generatedAlgorithmicBuilds.model.maxPoints}`
}
