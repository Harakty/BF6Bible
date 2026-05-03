import type { Localized, Tier, WeaponMetric } from './data'
import { consensusBuilds } from './generated/consensusBuilds'
import { generatedStatForName, normalizeWeaponName, rangeValue, type GeneratedWeaponStat, type RangeNumberMap } from './weaponStats'

export type MetaScenarioId = 'all' | 'assault' | 'support' | 'engineer' | 'recon'

type WeaponClassKey =
  | 'assaultRifle'
  | 'carbine'
  | 'lmg'
  | 'smg'
  | 'dmr'
  | 'sniper'
  | 'shotgun'
  | 'sidearm'
  | 'unknown'

type ScoreKey =
  | 'publicSignal'
  | 'killSpeed'
  | 'armorValue'
  | 'effectiveRange'
  | 'control'
  | 'sustain'
  | 'mobility'
  | 'roleFit'
  | 'dataQuality'

type ScoreWeights = Partial<Record<ScoreKey, number>>

export type ScoreComponent = {
  key: ScoreKey
  label: Localized
  score: number
  weight: number
}

export type RankedWeapon = {
  metric: WeaponMetric
  scenarioId: MetaScenarioId
  score: number
  calculatedTier: Tier
  roleFit: number
  dataQuality: number
  dataQualityLabel: Localized
  mpTtkMs?: number
  redsecTtkMs?: number
  components: ScoreComponent[]
}

export type MetaScenario = {
  id: MetaScenarioId
  label: Localized
  shortLabel: Localized
  description: Localized
  weights: ScoreWeights
}

const componentLabels: Record<ScoreKey, Localized> = {
  publicSignal: { it: 'Segnale pubblico', en: 'Public signal' },
  killSpeed: { it: 'Kill speed', en: 'Kill speed' },
  armorValue: { it: 'TTK REDSEC', en: 'REDSEC TTK' },
  effectiveRange: { it: 'Range utile', en: 'Effective range' },
  control: { it: 'Controllo', en: 'Control' },
  sustain: { it: 'Sustain', en: 'Sustain' },
  mobility: { it: 'Mobilità', en: 'Mobility' },
  roleFit: { it: 'Fit ruolo', en: 'Role fit' },
  dataQuality: { it: 'Qualità dati', en: 'Data quality' },
}

const consensusTargetScore: Record<string, number> = {
  META: 86,
  A: 76,
  B: 66,
  C: 56,
  D: 44,
}

const consensusPriorWeight = 0.8

const consensusByNormalizedWeapon = new Map(
  Object.entries(consensusBuilds.builds).flatMap(([weaponName, build]) => {
    const sourceSlug = build.sourceUrl.split('/').filter(Boolean).at(-1)
    return [
      [normalizeWeaponName(weaponName), build] as const,
      ...(sourceSlug ? ([[normalizeWeaponName(sourceSlug), build] as const] as const) : []),
    ]
  }),
)

export const metaScenarios: MetaScenario[] = [
  {
    id: 'all',
    label: { it: 'Tutte le armi', en: 'All weapons' },
    shortLabel: { it: 'Generale', en: 'General' },
    description: {
      it: 'Ranking generale REDSEC: combina danni, ROF, ADS, reload, velocity, mag, controllo, mobilità e ruolo.',
      en: 'General REDSEC ranking: blends damage, ROF, ADS, reload, velocity, mag, control, mobility, and role.',
    },
    weights: {
      publicSignal: 0.24,
      killSpeed: 0.2,
      armorValue: 0.17,
      effectiveRange: 0.14,
      control: 0.1,
      sustain: 0.08,
      dataQuality: 0.07,
    },
  },
  {
    id: 'assault',
    label: { it: 'Assalto entry', en: 'Assault entry' },
    shortLabel: { it: 'Assalto', en: 'Assault' },
    description: {
      it: 'Pesa apertura fight, TTK 20 m, ADS, mobilità e armi che possono entrare senza perdere valore appena il fight si apre.',
      en: 'Weights fight entry, 20 m TTK, ADS, mobility, and weapons that can enter without collapsing when the fight opens up.',
    },
    weights: {
      roleFit: 0.25,
      killSpeed: 0.24,
      mobility: 0.17,
      armorValue: 0.13,
      control: 0.1,
      publicSignal: 0.06,
      dataQuality: 0.05,
    },
  },
  {
    id: 'support',
    label: { it: 'Supporto anchor', en: 'Support anchor' },
    shortLabel: { it: 'Supporto', en: 'Support' },
    description: {
      it: 'Pesa sustain reale da mag/reload, lane control, copertura revive e TTK proxy 180 HP nei fight lunghi.',
      en: 'Weights real mag/reload sustain, lane control, revive cover, and 180 HP proxy TTK in long fights.',
    },
    weights: {
      roleFit: 0.24,
      sustain: 0.22,
      armorValue: 0.17,
      effectiveRange: 0.13,
      control: 0.11,
      publicSignal: 0.07,
      dataQuality: 0.06,
    },
  },
  {
    id: 'engineer',
    label: { it: 'Geniere flex/AV', en: 'Engineer flex/AV' },
    shortLabel: { it: 'Geniere', en: 'Engineer' },
    description: {
      it: 'Pesa flessibilità infantry, mobilità, ADS, close-mid reliability e armi che lasciano spazio mentale al counterplay veicoli.',
      en: 'Weights infantry flexibility, mobility, ADS, close-mid reliability, and weapons that leave mental bandwidth for vehicle counterplay.',
    },
    weights: {
      roleFit: 0.28,
      mobility: 0.2,
      killSpeed: 0.16,
      armorValue: 0.13,
      control: 0.11,
      publicSignal: 0.06,
      dataQuality: 0.06,
    },
  },
  {
    id: 'recon',
    label: { it: 'Ricognitore info', en: 'Recon info' },
    shortLabel: { it: 'Ricognitore', en: 'Recon' },
    description: {
      it: 'Pesa range, conversione degli armor crack, velocity, info pressure e armi che permettono al Recon di tradare quando deve muoversi.',
      en: 'Weights range, armor-crack conversion, velocity, information pressure, and weapons that let Recon trade while moving.',
    },
    weights: {
      roleFit: 0.38,
      effectiveRange: 0.24,
      control: 0.13,
      armorValue: 0.08,
      killSpeed: 0.05,
      publicSignal: 0.05,
      dataQuality: 0.07,
    },
  },
]

export function getMetaScenario(id: MetaScenarioId) {
  return metaScenarios.find((scenario) => scenario.id === id) ?? metaScenarios[0]
}

export function rankWeapons(weapons: WeaponMetric[], scenarioId: MetaScenarioId): RankedWeapon[] {
  const scenario = getMetaScenario(scenarioId)
  return weapons
    .map((metric) => scoreWeapon(metric, scenario))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.roleFit - a.roleFit ||
        b.dataQuality - a.dataQuality ||
        b.metric.redsecScore - a.metric.redsecScore,
    )
}

function scoreWeapon(metric: WeaponMetric, scenario: MetaScenario): RankedWeapon {
  const stat = generatedStatForName(metric.weapon.name.en)
  const classKey = classifyWeapon(metric, stat)
  const mpTtkMs = stat ? rangeValue(stat.clickTtk100ByRange, [20, 10, 0, 35]) : metric.baselineTtkMs
  const redsecTtkMs = stat ? rangeValue(stat.clickTtk180ByRange, [35, 20, 50, 10]) : undefined
  const base = {
    publicSignal: publicSignalScore(metric, stat),
    killSpeed: killSpeedScore(metric, classKey, stat),
    effectiveRange: rangeScore(classKey, stat),
    control: controlScore(classKey, stat),
    sustain: sustainScore(metric, classKey, stat),
    mobility: mobilityScore(classKey, stat),
    roleFit: roleFitScore(scenario.id, classKey),
    dataQuality: dataQualityScore(metric, stat),
  }
  const armorValue = armorValueScore(stat, base)
  const scores: Record<ScoreKey, number> = { ...base, armorValue }

  const components = Object.entries(scenario.weights).map(([key, weight]) => ({
    key: key as ScoreKey,
    label: componentLabels[key as ScoreKey],
    score: scores[key as ScoreKey],
    weight: weight ?? 0,
  }))

  const weighted = components.reduce((sum, component) => sum + component.score * component.weight, 0)
  const score = clamp(Math.round(weighted + consensusBoost(metric.weapon.name.en, weighted)), 0, 100)

  return {
    metric,
    scenarioId: scenario.id,
    score,
    calculatedTier: scoreToTier(score),
    roleFit: scores.roleFit,
    dataQuality: scores.dataQuality,
    dataQualityLabel: dataQualityLabel(scores.dataQuality),
    mpTtkMs,
    redsecTtkMs,
    components,
  }
}

function consensusBoost(weaponName: string, currentScore: number) {
  const consensus = consensusByNormalizedWeapon.get(normalizeWeaponName(weaponName))
  if (!consensus) return 0

  const target = consensusTargetScore[consensus.tier]
  if (target === undefined) return 0

  return (target - currentScore) * consensusPriorWeight
}

function classifyWeapon(metric: WeaponMetric, stat?: GeneratedWeaponStat): WeaponClassKey {
  if (stat) return stat.categoryKey as WeaponClassKey

  const value = metric.className.en.toLowerCase()
  if (value.includes('assault')) return 'assaultRifle'
  if (value.includes('carbine')) return 'carbine'
  if (value.includes('lmg')) return 'lmg'
  if (value.includes('smg')) return 'smg'
  if (value.includes('dmr')) return 'dmr'
  if (value.includes('sniper')) return 'sniper'
  if (value.includes('shotgun')) return 'shotgun'
  if (value.includes('pistol') || value.includes('revolver')) return 'sidearm'
  return 'unknown'
}

function publicSignalScore(metric: WeaponMetric, stat?: GeneratedWeaponStat) {
  if (!stat) return metric.redsecScore
  const redsec35 = statRangeValue(stat.ttk180ByRange, [35, 20, 50, 10])
  const ttkScore = redsec35 ? inverseScore(redsec35, 470, 1250) : metric.redsecScore
  const sustain = sustainScore(metric, stat.categoryKey as WeaponClassKey, stat)
  const handling = Math.round(((stat.control ?? 50) + (stat.mobility ?? 50)) / 2)
  return Math.round(ttkScore * 0.5 + sustain * 0.25 + handling * 0.25)
}

function killSpeedScore(metric: WeaponMetric, classKey: WeaponClassKey, stat?: GeneratedWeaponStat) {
  if (stat) {
    if (stat.categoryKey === 'sniper') return headshotPickScore(stat)

    const bodyScore = bodyKillSpeedScore(stat)
    if (bodyScore !== undefined) return bodyScore
  }

  if (metric.baselineTtkMs) return inverseScore(metric.baselineTtkMs, 190, 680)

  const fallback: Record<WeaponClassKey, number> = {
    shotgun: 78,
    sniper: 72,
    assaultRifle: 68,
    carbine: 68,
    smg: 70,
    lmg: 64,
    dmr: 60,
    sidearm: 48,
    unknown: 55,
  }
  return fallback[classKey]
}

function armorValueScore(stat: GeneratedWeaponStat | undefined, base: Omit<Record<ScoreKey, number>, 'armorValue'>) {
  if (!stat) {
    return Math.round(base.killSpeed * 0.38 + base.effectiveRange * 0.24 + base.sustain * 0.24 + base.control * 0.14)
  }

  const close = statRangeValue(stat.clickTtk180ByRange, [20, 10, 0, 35])
  const mid = statRangeValue(stat.clickTtk180ByRange, [35, 50, 20])
  const far = statRangeValue(stat.clickTtk180ByRange, [50, 70, 80])
  const closeScore = close ? inverseScore(close, 430, 1200) : 55
  const midScore = mid ? inverseScore(mid, 500, 1350) : 50
  const farScore = far ? inverseScore(far, 650, 1650) : 45
  return Math.round(closeScore * 0.42 + midScore * 0.38 + farScore * 0.2)
}

function sustainScore(metric: WeaponMetric, classKey: WeaponClassKey, stat?: GeneratedWeaponStat) {
  if (stat) {
    const mag = stat.magSize ?? 0
    const reload = stat.reloadSeconds ?? 4
    const magScore = clamp(Math.round(32 + mag * (classKey === 'lmg' ? 0.56 : 1.15)), 35, 100)
    const reloadScore = inverseScore(reload, 1.7, 7.5)
    return Math.round(magScore * 0.68 + reloadScore * 0.32)
  }

  if (metric.magSize) return clamp(Math.round(40 + metric.magSize * 0.85), 45, 100)

  const fallback: Record<WeaponClassKey, number> = {
    lmg: 86,
    assaultRifle: 70,
    carbine: 68,
    smg: 66,
    dmr: 58,
    shotgun: 48,
    sniper: 42,
    sidearm: 40,
    unknown: 52,
  }
  return fallback[classKey]
}

function rangeScore(classKey: WeaponClassKey, stat?: GeneratedWeaponStat) {
  if (stat) {
    if (stat.categoryKey === 'sniper') {
      const precision = stat.precision !== undefined ? scaleScore(stat.precision, 0, 100) : 80
      const velocity = stat.velocity ? scaleScore(stat.velocity, 320, 1050) : 55
      const headDamage70 = statRangeValue(stat.headDamageByRange, [70, 80, 50, 35, 20, 10])
      const headBreak = headDamage70 ? clamp(Math.round((headDamage70 / 112) * 100), 55, 100) : 70
      return Math.round(precision * 0.42 + velocity * 0.25 + headBreak * 0.33)
    }

    const damage20 = statRangeValue(stat.bodyDamageByRange, [20, 10, 0])
    const damage50 = statRangeValue(stat.bodyDamageByRange, [50, 70, 35])
    const redsec50 = statRangeValue(stat.clickTtk180ByRange, [50, 70, 35])
    const retention = damage20 && damage50 ? clamp(Math.round((damage50 / damage20) * 100), 25, 100) : 55
    const ttkRange = redsec50 ? inverseScore(redsec50, 650, 1650) : 50
    const velocity = stat.velocity ? scaleScore(stat.velocity, 320, 1050) : 55
    return Math.round(retention * 0.42 + ttkRange * 0.38 + velocity * 0.2)
  }

  const score: Record<WeaponClassKey, number> = {
    sniper: 96,
    dmr: 90,
    lmg: 84,
    assaultRifle: 82,
    carbine: 80,
    smg: 58,
    shotgun: 38,
    sidearm: 28,
    unknown: 50,
  }
  return score[classKey]
}

function controlScore(classKey: WeaponClassKey, stat?: GeneratedWeaponStat) {
  if (stat) {
    const control = stat.control !== undefined ? scaleScore(stat.control, 0, 70) : 55
    const precision = stat.precision !== undefined ? scaleScore(stat.precision, 0, 100) : 55
    return clamp(Math.round(control * 0.68 + precision * 0.32), 0, 100)
  }

  const score: Record<WeaponClassKey, number> = {
    assaultRifle: 84,
    carbine: 82,
    lmg: 78,
    dmr: 78,
    smg: 74,
    sniper: 66,
    shotgun: 56,
    sidearm: 62,
    unknown: 60,
  }
  return score[classKey]
}

function mobilityScore(classKey: WeaponClassKey, stat?: GeneratedWeaponStat) {
  if (stat) {
    const adsScore = stat.adsMs ? inverseScore(stat.adsMs, 160, 450) : 55
    const mobility = stat.mobility !== undefined ? scaleScore(stat.mobility, 20, 80) : 55
    return clamp(Math.round(mobility * 0.58 + adsScore * 0.42), 0, 100)
  }

  const score: Record<WeaponClassKey, number> = {
    sidearm: 94,
    smg: 90,
    carbine: 84,
    shotgun: 78,
    assaultRifle: 76,
    dmr: 64,
    sniper: 52,
    lmg: 48,
    unknown: 60,
  }
  return score[classKey]
}

function roleFitScore(scenarioId: MetaScenarioId, classKey: WeaponClassKey) {
  const roleFit: Record<MetaScenarioId, Record<WeaponClassKey, number>> = {
    all: {
      assaultRifle: 88,
      carbine: 86,
      lmg: 84,
      dmr: 80,
      smg: 78,
      sniper: 72,
      shotgun: 62,
      sidearm: 34,
      unknown: 50,
    },
    assault: {
      assaultRifle: 96,
      carbine: 88,
      smg: 86,
      shotgun: 76,
      lmg: 58,
      dmr: 56,
      sniper: 42,
      sidearm: 30,
      unknown: 50,
    },
    support: {
      lmg: 97,
      assaultRifle: 84,
      carbine: 78,
      dmr: 72,
      smg: 70,
      shotgun: 48,
      sniper: 42,
      sidearm: 28,
      unknown: 50,
    },
    engineer: {
      carbine: 95,
      smg: 90,
      shotgun: 78,
      assaultRifle: 76,
      dmr: 66,
      lmg: 60,
      sniper: 46,
      sidearm: 28,
      unknown: 50,
    },
    recon: {
      dmr: 100,
      sniper: 98,
      carbine: 55,
      assaultRifle: 45,
      smg: 34,
      shotgun: 46,
      lmg: 44,
      sidearm: 34,
      unknown: 50,
    },
  }
  return roleFit[scenarioId][classKey]
}

function dataQualityScore(metric: WeaponMetric, stat?: GeneratedWeaponStat) {
  if (stat) return 100

  const known = [metric.baselineTtkMs, metric.baselineStk, metric.magSize].filter((value) => value !== undefined).length
  const completeness = known / 3
  return Math.min(99, Math.round(metric.confidence * 55 + completeness * 45))
}

function dataQualityLabel(score: number): Localized {
  if (score >= 95) return { it: 'Aggiornati', en: 'Updated' }
  if (score >= 75) return { it: 'Completa', en: 'Complete' }
  if (score >= 50) return { it: 'Parziale', en: 'Partial' }
  return { it: 'Da validare', en: 'Needs validation' }
}

function headshotPickScore(stat: GeneratedWeaponStat) {
  const headDamage = statRangeValue(stat.headDamageByRange, [50, 70, 80, 35, 20, 10])
  if (!headDamage || !stat.rpm) return 70

  const stk = Math.ceil(100 / headDamage)
  const range = statRangeValue(stat.headDamageByRange, [70, 80]) ? 70 : 50
  const ttk = (stk - 1) * (60000 / stat.rpm) + (stat.velocity ? (range / stat.velocity) * 1000 : 0)
  return inverseScore(Math.round(ttk), 60, 950)
}

function bodyKillSpeedScore(stat: GeneratedWeaponStat) {
  const ttk20 = statRangeValue(stat.clickTtk100ByRange, [20, 10, 0, 35])
  return ttk20 ? inverseScore(ttk20, 190, 680) : undefined
}

function statRangeValue(map: RangeNumberMap, preferredRanges: number[]) {
  return rangeValue(map, preferredRanges)
}

function inverseScore(value: number, best: number, worst: number) {
  return clamp(Math.round(100 - ((value - best) / (worst - best)) * 100), 0, 100)
}

function scaleScore(value: number, min: number, max: number) {
  return clamp(Math.round(((value - min) / (max - min)) * 100), 0, 100)
}

function scoreToTier(score: number): Tier {
  if (score >= 86) return 'S+'
  if (score >= 80) return 'S'
  if (score >= 72) return 'A'
  if (score >= 62) return 'B'
  if (score >= 50) return 'C'
  return 'D'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export const metaEngineTestHooks = {
  bodyKillSpeedScore,
  dataQualityScore,
  headshotPickScore,
  scoreToTier,
}
