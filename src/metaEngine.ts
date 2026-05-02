import type { Localized, Tier, WeaponMetric } from './data'

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
  components: ScoreComponent[]
  rationale: Localized
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
  armorValue: { it: 'Armor value', en: 'Armor value' },
  effectiveRange: { it: 'Range utile', en: 'Effective range' },
  control: { it: 'Controllo', en: 'Control' },
  sustain: { it: 'Sustain', en: 'Sustain' },
  mobility: { it: 'Mobilità', en: 'Mobility' },
  roleFit: { it: 'Fit ruolo', en: 'Role fit' },
  dataQuality: { it: 'Qualità dati', en: 'Data quality' },
}

export const metaScenarios: MetaScenario[] = [
  {
    id: 'all',
    label: { it: 'Tutte le armi', en: 'All weapons' },
    shortLabel: { it: 'Generale', en: 'General' },
    description: {
      it: 'Ranking generale REDSEC: combina segnale pubblico, TTK/STK disponibili, armor value, range, controllo e qualità del dato.',
      en: 'General REDSEC ranking: blends public signal, available TTK/STK, armor value, range, control, and data quality.',
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
      it: 'Pesa apertura fight, TTK pratico, mobilità e armi che possono entrare senza perdere valore appena il fight si apre.',
      en: 'Weights fight entry, practical TTK, mobility, and weapons that can enter without collapsing when the fight opens up.',
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
      it: 'Pesa sustain, caricatore, lane control, copertura revive e affidabilità nei fight lunghi contro armor.',
      en: 'Weights sustain, magazine, lane control, revive cover, and reliability in long armor fights.',
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
      it: 'Pesa flessibilità infantry, mobilità, close-mid reliability e armi che lasciano spazio mentale al counterplay veicoli.',
      en: 'Weights infantry flexibility, mobility, close-mid reliability, and weapons that leave mental bandwidth for vehicle counterplay.',
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
      it: 'Pesa range, conversione degli armor crack, info pressure e armi che permettono al Recon di tradare quando deve muoversi.',
      en: 'Weights range, armor-crack conversion, information pressure, and weapons that let Recon trade while moving.',
    },
    weights: {
      roleFit: 0.29,
      effectiveRange: 0.23,
      control: 0.12,
      armorValue: 0.11,
      killSpeed: 0.1,
      publicSignal: 0.08,
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
  const classKey = classifyWeapon(metric)
  const base = {
    publicSignal: metric.redsecScore,
    killSpeed: killSpeedScore(metric, classKey),
    effectiveRange: rangeScore(classKey),
    control: controlScore(classKey),
    sustain: sustainScore(metric, classKey),
    mobility: mobilityScore(classKey),
    roleFit: roleFitScore(scenario.id, classKey),
    dataQuality: dataQualityScore(metric),
  }
  const armorValue = Math.round(base.killSpeed * 0.38 + base.effectiveRange * 0.24 + base.sustain * 0.24 + base.control * 0.14)
  const scores: Record<ScoreKey, number> = { ...base, armorValue }

  const components = Object.entries(scenario.weights).map(([key, weight]) => ({
    key: key as ScoreKey,
    label: componentLabels[key as ScoreKey],
    score: scores[key as ScoreKey],
    weight: weight ?? 0,
  }))

  const weighted = components.reduce((sum, component) => sum + component.score * component.weight, 0)
  const score = Math.round(weighted)
  const top = [...components].sort((a, b) => b.score * b.weight - a.score * a.weight).slice(0, 3)

  return {
    metric,
    scenarioId: scenario.id,
    score,
    calculatedTier: scoreToTier(score),
    roleFit: scores.roleFit,
    dataQuality: scores.dataQuality,
    dataQualityLabel: dataQualityLabel(scores.dataQuality),
    components,
    rationale: {
      it: `Calcolato da ${top.map((item) => item.label.it.toLowerCase()).join(', ')}; i valori mancanti restano penalizzati nella qualità dati.`,
      en: `Calculated from ${top.map((item) => item.label.en.toLowerCase()).join(', ')}; missing values are still penalized through data quality.`,
    },
  }
}

function classifyWeapon(metric: WeaponMetric): WeaponClassKey {
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

function killSpeedScore(metric: WeaponMetric, classKey: WeaponClassKey) {
  if (metric.baselineTtkMs) {
    return clamp(Math.round(150 - metric.baselineTtkMs / 5), 35, 100)
  }

  const fallback: Record<WeaponClassKey, number> = {
    shotgun: 88,
    sniper: 86,
    assaultRifle: 72,
    carbine: 72,
    smg: 74,
    lmg: 68,
    dmr: 62,
    sidearm: 48,
    unknown: 55,
  }
  return fallback[classKey]
}

function sustainScore(metric: WeaponMetric, classKey: WeaponClassKey) {
  if (metric.magSize) {
    return clamp(Math.round(40 + metric.magSize * 0.85), 45, 100)
  }

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

function rangeScore(classKey: WeaponClassKey) {
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

function controlScore(classKey: WeaponClassKey) {
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

function mobilityScore(classKey: WeaponClassKey) {
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
      dmr: 97,
      sniper: 98,
      carbine: 80,
      assaultRifle: 70,
      smg: 58,
      shotgun: 46,
      lmg: 44,
      sidearm: 34,
      unknown: 50,
    },
  }
  return roleFit[scenarioId][classKey]
}

function dataQualityScore(metric: WeaponMetric) {
  const known = [metric.baselineTtkMs, metric.baselineStk, metric.magSize].filter((value) => value !== undefined).length
  const completeness = known / 3
  return Math.round(metric.confidence * 55 + completeness * 45)
}

function dataQualityLabel(score: number): Localized {
  if (score >= 75) return { it: 'Buona', en: 'Good' }
  if (score >= 50) return { it: 'Parziale', en: 'Partial' }
  return { it: 'Da validare', en: 'Needs validation' }
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
