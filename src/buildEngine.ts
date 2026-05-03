import { generatedTemplateBuilds } from './generated/templateBuilds'
import { normalizeWeaponName } from './weaponStats'

export type TemplateBuild = (typeof generatedTemplateBuilds.builds)[number]
export type TemplateAttachment = TemplateBuild['attachments'][number]

export const templateBuilds = generatedTemplateBuilds.builds

const buildByWeapon = new Map(
  generatedTemplateBuilds.builds.map((build) => [normalizeWeaponName(build.weaponName), build]),
)

export function templateBuildForWeapon(weaponName: string) {
  return buildByWeapon.get(normalizeWeaponName(weaponName))
}

export function templateBuildPointLabel(build: TemplateBuild) {
  return `${build.totalPoints}/${generatedTemplateBuilds.model.maxPoints}`
}
