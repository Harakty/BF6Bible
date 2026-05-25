import type { Localized, WeaponMetric } from './data'
import { consensusBuilds } from './generated/consensusBuilds'
import { generatedChaseBuilds } from './generated/chaseBuilds'
import { generatedSolvedBuilds } from './generated/solvedBuilds'
import { rankWeapons, type MetaScenarioId, type RankedWeapon } from './metaEngine'
import { normalizeWeaponName } from './weaponStats'

export type PlannerRoleId = 'assault-entry' | 'support-anchor' | 'engineer-av' | 'recon-info'
export type PlannerVariantId = 'default' | 'alternative'

type PlannerSlotProfile = {
  classes: string[]
  consensusCategory?: string
  ordinal: number
  label: Localized
}

type PlannerPairProfile = {
  roleId: PlannerRoleId
  variantId: PlannerVariantId
  scenarioId: MetaScenarioId
  primary: PlannerSlotProfile
  secondary: PlannerSlotProfile
  synergy: Localized
}

export type PlannerWeaponSelection = {
  weaponName: string
  className: string
  score: number
  scenarioScore: number
  roleFit: number
  categoryRank: RankedWeapon['categoryRank']
  categoryTier: RankedWeapon['categoryTier']
  consensusTier?: string
  consensusCategory?: string
  consensusCategoryRank?: number
  weaponTypeRank?: number
  ttkScore: number
  rangeCoverage: number
  buildCompleteness: number
}

export type PlannerLoadoutPair = {
  roleId: PlannerRoleId
  variantId: PlannerVariantId
  scenarioId: MetaScenarioId
  score: number
  primary: PlannerWeaponSelection
  secondary: PlannerWeaponSelection
  reason: Localized
  sourceIds: string[]
}

const plannerProfiles: Record<`${PlannerRoleId}:${PlannerVariantId}`, PlannerPairProfile> = {
  'assault-entry:default': {
    roleId: 'assault-entry',
    variantId: 'default',
    scenarioId: 'assault',
    primary: {
      classes: ['Assault Rifle'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'AR controllo', en: 'control AR' },
    },
    secondary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG close', en: 'close SMG' },
    },
    synergy: {
      it: 'apre fight mid range e copre la chiusura sotto i 20 m',
      en: 'opens mid-range fights and covers the close under-20 m finish',
    },
  },
  'assault-entry:alternative': {
    roleId: 'assault-entry',
    variantId: 'alternative',
    scenarioId: 'assault',
    primary: {
      classes: ['Assault Rifle'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'AR close', en: 'close AR' },
    },
    secondary: {
      classes: ['Carbine'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'carbine range', en: 'range carbine' },
    },
    synergy: {
      it: 'sposta l entry sul close senza perdere copertura quando il fight si apre',
      en: 'moves entry pressure into close range without losing open-fight coverage',
    },
  },
  'support-anchor:default': {
    roleId: 'support-anchor',
    variantId: 'default',
    scenarioId: 'support',
    primary: {
      classes: ['LMG'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'LMG sustain', en: 'sustain LMG' },
    },
    secondary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG difesa close', en: 'close-defense SMG' },
    },
    synergy: {
      it: 'massimizza lane control e mantiene una risposta rapida ai push ravvicinati',
      en: 'maximizes lane control while keeping a fast answer to close pushes',
    },
  },
  'support-anchor:alternative': {
    roleId: 'support-anchor',
    variantId: 'alternative',
    scenarioId: 'support',
    primary: {
      classes: ['LMG'],
      consensusCategory: 'Long Range',
      ordinal: 2,
      label: { it: 'seconda LMG sustain', en: 'second sustain LMG' },
    },
    secondary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG difesa close', en: 'close-defense SMG' },
    },
    synergy: {
      it: 'mantiene il profilo anchor scegliendo la seconda LMG migliore invece di una preferenza manuale',
      en: 'keeps the anchor profile by taking the second-best LMG instead of a manual preference',
    },
  },
  'engineer-av:default': {
    roleId: 'engineer-av',
    variantId: 'default',
    scenarioId: 'engineer',
    primary: {
      classes: ['Carbine'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'carbine flex', en: 'flex carbine' },
    },
    secondary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG close', en: 'close SMG' },
    },
    synergy: {
      it: 'lascia spazio mentale alla utility anti-veicolo senza perdere duelli infantry',
      en: 'leaves bandwidth for anti-vehicle utility without giving up infantry duels',
    },
  },
  'engineer-av:alternative': {
    roleId: 'engineer-av',
    variantId: 'alternative',
    scenarioId: 'engineer',
    primary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG bunker', en: 'bunker SMG' },
    },
    secondary: {
      classes: ['Carbine'],
      consensusCategory: 'Long Range',
      ordinal: 2,
      label: { it: 'carbine range alternativa', en: 'alternative range carbine' },
    },
    synergy: {
      it: 'usa la top SMG quando il cerchio e indoor e conserva una carbine da rotazione',
      en: 'uses the top SMG when the circle is indoor and keeps a rotation carbine',
    },
  },
  'recon-info:default': {
    roleId: 'recon-info',
    variantId: 'default',
    scenarioId: 'recon',
    primary: {
      classes: ['DMR'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'DMR info', en: 'info DMR' },
    },
    secondary: {
      classes: ['Carbine'],
      consensusCategory: 'Long Range',
      ordinal: 1,
      label: { it: 'carbine mobile', en: 'mobile carbine' },
    },
    synergy: {
      it: 'massimizza info-pick e conversione armor crack senza restare scoperto in rotazione',
      en: 'maximizes info-picks and armor-crack conversion without being exposed on rotates',
    },
  },
  'recon-info:alternative': {
    roleId: 'recon-info',
    variantId: 'alternative',
    scenarioId: 'recon',
    primary: {
      classes: ['Sniper'],
      consensusCategory: 'Sniper',
      ordinal: 1,
      label: { it: 'sniper pick', en: 'pick sniper' },
    },
    secondary: {
      classes: ['SMG'],
      consensusCategory: 'Close Range',
      ordinal: 1,
      label: { it: 'SMG anti-push', en: 'anti-push SMG' },
    },
    synergy: {
      it: 'apre linee lunghe e usa la SMG top solo per sopravvivere ai push',
      en: 'opens long sightlines and uses the top SMG only to survive close pushes',
    },
  },
}

const solvedBuildByWeapon = new Set(
  generatedSolvedBuilds.builds.map((build) => normalizeWeaponName(build.weaponName)),
)

const chaseBuildByWeapon = new Set(
  Object.values(generatedChaseBuilds.builds).map((build) => normalizeWeaponName(build.weaponName)),
)

export function getPlannerProfile(roleId: PlannerRoleId, variantId: PlannerVariantId) {
  return plannerProfiles[`${roleId}:${variantId}`]
}

export function pickPlannerLoadoutPair(
  candidates: WeaponMetric[],
  roleId: PlannerRoleId,
  variantId: PlannerVariantId,
): PlannerLoadoutPair {
  const profile = getPlannerProfile(roleId, variantId)
  const ranked = rankWeapons(candidates, profile.scenarioId)
  const primary = pickSlotWeapon(ranked, profile.primary)
  const secondary = pickSlotWeapon(ranked, profile.secondary, new Set([primary.weaponName]))
  const score = Math.round(primary.score * 0.62 + secondary.score * 0.28 + pairCoverageScore(primary, secondary) * 0.1)

  return {
    roleId,
    variantId,
    scenarioId: profile.scenarioId,
    score,
    primary,
    secondary,
    reason: plannerReason(profile, primary, secondary, score),
    sourceIds: ['sheetonmyface', 'battlefieldmeta', 'chasenoface-redsec'],
  }
}

function pickSlotWeapon(
  ranked: RankedWeapon[],
  slotProfile: PlannerSlotProfile,
  excludedWeaponNames = new Set<string>(),
): PlannerWeaponSelection {
  const candidates = ranked
    .filter((entry) => slotProfile.classes.includes(entry.metric.className.en))
    .filter((entry) => !excludedWeaponNames.has(entry.metric.weapon.name.en))
    .map((entry) => scorePlannerWeapon(entry, slotProfile))
    .sort(comparePlannerWeapons)

  if (candidates.length === 0) {
    throw new Error(`No planner candidates for ${slotProfile.label.en}`)
  }

  return candidates[Math.min(slotProfile.ordinal - 1, candidates.length - 1)]
}

function scorePlannerWeapon(ranked: RankedWeapon, slotProfile: PlannerSlotProfile): PlannerWeaponSelection {
  const weaponName = ranked.metric.weapon.name.en
  const consensus = consensusBuilds.builds[weaponName as keyof typeof consensusBuilds.builds]
  const consensusCategory = consensus?.categoryRank.category
  const weaponTypeRank =
    consensus && 'rankingConsensus' in consensus && 'weaponTypeRank' in consensus.rankingConsensus
      ? consensus.rankingConsensus.weaponTypeRank.position
      : consensus?.categoryRank.position
  const categoryRankScore = rankScore(ranked.categoryRank.position, ranked.categoryRank.total)
  const publicScore = consensusTierScore(consensus?.tier)
  const consensusRankScore = rankScore(weaponTypeRank ?? ranked.categoryRank.position, ranked.categoryRank.total)
  const scenarioRoleScore = Math.round(ranked.score * 0.65 + ranked.roleFit * 0.35)
  const ttkScore = componentAverage(ranked, ['killSpeed', 'armorValue'])
  const rangeCoverage = slotProfile.consensusCategory
    ? consensusCategory === slotProfile.consensusCategory
      ? 100
      : 55
    : 75
  const buildCompleteness = buildCompletenessScore(weaponName)
  const score = Math.round(
    scenarioRoleScore * 0.3 +
      categoryRankScore * 0.2 +
      publicScore * 0.15 +
      rangeCoverage * 0.15 +
      ttkScore * 0.1 +
      buildCompleteness * 0.05 +
      consensusRankScore * 0.05,
  )

  return {
    weaponName,
    className: ranked.metric.className.en,
    score,
    scenarioScore: ranked.score,
    roleFit: ranked.roleFit,
    categoryRank: ranked.categoryRank,
    categoryTier: ranked.categoryTier,
    consensusTier: consensus?.tier,
    consensusCategory,
    consensusCategoryRank: consensus?.categoryRank.position,
    weaponTypeRank,
    ttkScore,
    rangeCoverage,
    buildCompleteness,
  }
}

function comparePlannerWeapons(a: PlannerWeaponSelection, b: PlannerWeaponSelection) {
  return (
    b.score - a.score ||
    (a.weaponTypeRank ?? Number.POSITIVE_INFINITY) - (b.weaponTypeRank ?? Number.POSITIVE_INFINITY) ||
    a.categoryRank.position - b.categoryRank.position ||
    a.weaponName.localeCompare(b.weaponName)
  )
}

function rankScore(position: number, total: number) {
  if (!Number.isFinite(position) || position <= 0) return 50
  if (total <= 1) return 100
  return Math.round(100 - ((position - 1) / (total - 1)) * 100)
}

function consensusTierScore(tier?: string) {
  if (tier === 'META') return 100
  if (tier === 'A') return 82
  if (tier === 'B') return 64
  if (tier === 'C') return 44
  if (tier === 'D') return 25
  return 50
}

function componentAverage(ranked: RankedWeapon, keys: Array<RankedWeapon['components'][number]['key']>) {
  const values = ranked.components.filter((component) => keys.includes(component.key)).map((component) => component.score)
  if (values.length === 0) return 50
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function buildCompletenessScore(weaponName: string) {
  const normalized = normalizeWeaponName(weaponName)
  const solved = solvedBuildByWeapon.has(normalized)
  const chase = chaseBuildByWeapon.has(normalized)
  if (solved && chase) return 100
  if (solved) return 90
  if (chase) return 80
  return 45
}

function pairCoverageScore(primary: PlannerWeaponSelection, secondary: PlannerWeaponSelection) {
  const categories = new Set([primary.consensusCategory, secondary.consensusCategory].filter(Boolean))
  if (categories.has('Long Range') && categories.has('Close Range')) return 100
  if (categories.size >= 2) return 85
  return 65
}

function plannerReason(
  profile: PlannerPairProfile,
  primary: PlannerWeaponSelection,
  secondary: PlannerWeaponSelection,
  score: number,
): Localized {
  return {
    it: `${primary.weaponName} (${profile.primary.label.it}) e ${secondary.weaponName} (${profile.secondary.label.it}) scelti dal Planner Score ${score}/100: rank categoria ${primary.categoryRank.position}/${primary.categoryRank.total} + ${secondary.categoryRank.position}/${secondary.categoryRank.total}, consensus ${primary.consensusTier ?? 'n/d'} + ${secondary.consensusTier ?? 'n/d'}, copertura ${profile.synergy.it}.`,
    en: `${primary.weaponName} (${profile.primary.label.en}) and ${secondary.weaponName} (${profile.secondary.label.en}) selected by Planner Score ${score}/100: category ranks ${primary.categoryRank.position}/${primary.categoryRank.total} + ${secondary.categoryRank.position}/${secondary.categoryRank.total}, consensus ${primary.consensusTier ?? 'n/a'} + ${secondary.consensusTier ?? 'n/a'}, coverage ${profile.synergy.en}.`,
  }
}
