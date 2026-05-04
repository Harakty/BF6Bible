import type { SolvedBuild } from './buildEngine'
import type { Lang } from './data'
import { effectUiCopy } from './effectCopy'
import { consensusBuilds } from './generated/consensusBuilds'
import type { RankedWeapon } from './metaEngine'
import { normalizeWeaponName } from './weaponStats'

const consensusByWeapon = new Map(
  Object.entries(consensusBuilds.builds).flatMap(([weaponName, build]) => {
    const sourceSlug = build.sourceUrl.split('/').filter(Boolean).at(-1)
    return [
      [normalizeWeaponName(weaponName), build] as const,
      ...(sourceSlug ? ([[normalizeWeaponName(sourceSlug), build] as const] as const) : []),
    ]
  }),
)

function formatMs(value: number | undefined, lang: Lang) {
  if (value !== undefined) return `${value}ms`
  return lang === 'it' ? 'non disponibile' : 'unavailable'
}

function attachmentName(attachment: SolvedBuild['attachments'][number], lang: Lang) {
  return attachment.name[lang] ?? attachment.name.en
}

export function generateRationale(
  weaponName: string,
  build: SolvedBuild,
  ranking: RankedWeapon | undefined,
  scenario: string,
  lang: Lang,
  totalInScenario = 55,
  positionInScenario = 1,
): string {
  if (!ranking) return ''

  const topEffects = Object.entries(build.effectTotals)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([key, value]) => `${effectUiCopy[key]?.[lang] ?? key} (+${value})`)

  const allNames = build.attachments
    .map((attachment) => attachmentName(attachment, lang))
    .join(', ')
  const consensus = consensusByWeapon.get(normalizeWeaponName(weaponName))
  const consensusTier = consensus?.tier

  const parts =
    lang === 'it'
      ? [
          `Tier ${ranking.calculatedTier} in ${scenario} (rank ${positionInScenario}/${totalInScenario})`,
          `TTK MP ${formatMs(ranking.mpTtkMs, lang)}, REDSEC ${formatMs(ranking.redsecTtkMs, lang)}`,
          `RoleFit ${ranking.roleFit}/100`,
          `Costo build ${build.totalPoints}/${build.weaponMaxBudget} sul cap arma`,
          topEffects.length ? `Il solver privilegia ${topEffects.join(', ')}` : '',
          allNames ? `Setup: ${allNames}` : '',
          consensusTier ? `Riferimento meta pubblica: ${consensusTier}` : '',
        ]
      : [
          `Tier ${ranking.calculatedTier} in ${scenario} (rank ${positionInScenario}/${totalInScenario})`,
          `MP TTK ${formatMs(ranking.mpTtkMs, lang)}, REDSEC ${formatMs(ranking.redsecTtkMs, lang)}`,
          `RoleFit ${ranking.roleFit}/100`,
          `Build cost ${build.totalPoints}/${build.weaponMaxBudget} against weapon cap`,
          topEffects.length ? `Solver prioritizes ${topEffects.join(', ')}` : '',
          allNames ? `Setup: ${allNames}` : '',
          consensusTier ? `Public meta reference: ${consensusTier}` : '',
        ]

  return `${parts.filter(Boolean).join('. ')}.`
}
