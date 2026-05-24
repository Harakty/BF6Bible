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

  const consensus = consensusByWeapon.get(normalizeWeaponName(weaponName))
  const consensusTier = consensus?.tier

  const parts =
    lang === 'it'
      ? [
          `Tier ${ranking.calculatedTier} in ${scenario} (rank ${positionInScenario}/${totalInScenario})`,
          `TTK MP ${formatMs(ranking.mpTtkMs, lang)}, REDSEC ${formatMs(ranking.redsecTtkMs, lang)}`,
          `RoleFit ${ranking.roleFit}/100`,
          topEffects.length ? `La build ufficiale BF6Bible privilegia ${topEffects.join(', ')}` : '',
          consensusTier ? `Riferimento meta pubblica: ${consensusTier}` : '',
        ]
      : [
          `Tier ${ranking.calculatedTier} in ${scenario} (rank ${positionInScenario}/${totalInScenario})`,
          `MP TTK ${formatMs(ranking.mpTtkMs, lang)}, REDSEC ${formatMs(ranking.redsecTtkMs, lang)}`,
          `RoleFit ${ranking.roleFit}/100`,
          topEffects.length ? `The official BF6Bible build prioritizes ${topEffects.join(', ')}` : '',
          consensusTier ? `Public meta reference: ${consensusTier}` : '',
        ]

  return `${parts.filter(Boolean).join('. ')}.`
}
