import { generatedTemplateBuilds } from './generated/templateBuilds'
import { generatedSolvedBuilds } from './generated/solvedBuilds'
import { normalizeWeaponName } from './weaponStats'

export type TemplateBuild = (typeof generatedTemplateBuilds.builds)[number]
export type TemplateAttachment = TemplateBuild['attachments'][number]
export type SolvedBuild = (typeof generatedSolvedBuilds.builds)[number]
export type SolvedAttachment = SolvedBuild['attachments'][number]

export const templateBuilds = generatedTemplateBuilds.builds
export const solvedBuilds = generatedSolvedBuilds.builds

const buildByWeapon = new Map(
  generatedTemplateBuilds.builds.map((build) => [normalizeWeaponName(build.weaponName), build]),
)
const solvedBuildByWeapon = new Map(
  generatedSolvedBuilds.builds.map((build) => [normalizeWeaponName(build.weaponName), build]),
)

export function templateBuildForWeapon(weaponName: string) {
  return buildByWeapon.get(normalizeWeaponName(weaponName))
}

export function solvedBuildForWeapon(weaponName: string) {
  return solvedBuildByWeapon.get(normalizeWeaponName(weaponName))
}

export function templateBuildPointLabel(build: TemplateBuild) {
  return `${build.totalPoints}/${generatedTemplateBuilds.model.maxPoints}`
}

export function solvedBuildPointLabel(build: SolvedBuild) {
  return `${build.totalPoints}/${generatedSolvedBuilds.model.maxPoints}`
}
