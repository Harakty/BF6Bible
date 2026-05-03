export const effectKeys = [
  'recoilControl',
  'recoilPrecision',
  'recoilRecovery',
  'weaponSway',
  'accuracyOverTime',
  'adsTimeTier',
  'adsMovingAccuracy',
  'adsMovementSpeed',
  'drawSpeed',
  'projectileVelocity',
  'hipfire',
  'hidingVisibility',
] as const

export type EffectKey = (typeof effectKeys)[number]
export type EffectVector = Partial<Record<EffectKey, number>>

export const attachmentSlots = ['muzzle', 'barrel', 'underbarrel', 'laser'] as const
export type AttachmentSlot = (typeof attachmentSlots)[number]

export type SolverAttachment = {
  id: string
  name: string
  slot: AttachmentSlot
  pointCost: number
  effects: EffectVector
}

export type ArchetypeId =
  | 'mid-control'
  | 'close-redsec'
  | 'anchor-sustain'
  | 'info-range'
  | 'mobile-pick'
  | 'building-clear'
  | 'mobile-flex'
  | 'emergency-backup'
  | 'balanced'

export type ArchetypeWeights = Partial<Record<EffectKey, number>>

export type ArchetypeProfile = {
  id: ArchetypeId
  label: { it: string; en: string }
  weights: ArchetypeWeights
  scarcityWeights?: ArchetypeWeights
  rationale: { it: string; en: string }
}

export type WeaponInputForSolver = {
  weaponId: string
  control?: number
  precision?: number
  mobility?: number
  velocity?: number
  adsMs?: number
}

export type SolvedBuild = {
  weaponId: string
  archetype: ArchetypeId
  attachments: SolverAttachment[]
  totalPoints: number
  objectiveScore: number
  effectTotals: EffectVector
  rationaleData: {
    chosenJustification: Array<{
      attachmentId: string
      reason: string
      alternativesConsidered: number
    }>
    rejectedTopRunnerUp?: {
      attachmentId: string
      slot: AttachmentSlot
      whyNotPicked: string
    }
  }
}

type SolverOption = SolverAttachment & { empty?: boolean }

type CandidateBuild = {
  options: SolverOption[]
  attachments: SolverAttachment[]
  totalPoints: number
  effectTotals: EffectVector
  objectiveRaw: number
  objectiveScore: number
  sortKey: string
}

const recoilEffects = new Set<EffectKey>(['recoilControl', 'recoilPrecision', 'recoilRecovery'])
const adsEffects = new Set<EffectKey>(['adsTimeTier', 'adsMovingAccuracy', 'adsMovementSpeed'])

// Weights are baseline engineering assumptions derived from the current archetype rationales.
// Sprint 3 consensus calibration should tune these numbers instead of treating them as ground truth.
export const archetypeProfiles: Record<ArchetypeId, ArchetypeProfile> = {
  // "teamfire 20-60 m": recoil stability first, then precision, velocity, and hidden signature.
  'mid-control': {
    id: 'mid-control',
    label: { it: 'Mid control REDSEC', en: 'REDSEC mid control' },
    weights: {
      recoilControl: 1,
      recoilPrecision: 0.8,
      projectileVelocity: 0.7,
      hidingVisibility: 0.5,
      recoilRecovery: 0.4,
      adsMovingAccuracy: 0.3,
    },
    rationale: {
      it: 'Priorita a controllo, velocity e firma silenziata: build da teamfire 20-60 m.',
      en: 'Prioritizes control, velocity, and suppressed signature: 20-60 m teamfire build.',
    },
  },
  // "push sotto i 25 m": hipfire and ADS handling define the build, signature is secondary.
  'close-redsec': {
    id: 'close-redsec',
    label: { it: 'Close REDSEC', en: 'REDSEC close' },
    weights: {
      hipfire: 1,
      adsTimeTier: 0.8,
      adsMovementSpeed: 0.6,
      hidingVisibility: 0.4,
      drawSpeed: 0.4,
      adsMovingAccuracy: 0.3,
    },
    rationale: {
      it: 'Costruita per push sotto i 25 m: hipfire, ADS rapido e firma ridotta.',
      en: 'Built for pushes under 25 m: hipfire, fast ADS, and reduced signature.',
    },
  },
  // "lane pressure": long fire windows reward control, recovery, sway, and accuracy over time.
  'anchor-sustain': {
    id: 'anchor-sustain',
    label: { it: 'Anchor sustain', en: 'Anchor sustain' },
    weights: {
      recoilControl: 1,
      recoilRecovery: 0.9,
      recoilPrecision: 0.7,
      weaponSway: 0.5,
      accuracyOverTime: 0.4,
    },
    rationale: {
      it: 'Stabilita e pressione lane per revive cover e fight lunghi contro armor.',
      en: 'Stability and lane pressure for revive cover and long armor fights.',
    },
  },
  // "mid-long armor cracks": precision and control lead; velocity helps conversion.
  'info-range': {
    id: 'info-range',
    label: { it: 'Info range', en: 'Info range' },
    weights: {
      recoilPrecision: 1,
      recoilControl: 0.9,
      projectileVelocity: 0.6,
      accuracyOverTime: 0.5,
      hidingVisibility: 0.4,
    },
    rationale: {
      it: 'Massimizza controllo e conversione degli armor crack a media-lunga distanza.',
      en: 'Maximizes control and conversion of armor cracks at mid-long range.',
    },
  },
  // "pick and reposition": draw/handling and velocity matter more than pure recoil.
  'mobile-pick': {
    id: 'mobile-pick',
    label: { it: 'Pick mobile', en: 'Mobile pick' },
    weights: {
      drawSpeed: 1,
      projectileVelocity: 0.8,
      adsMovementSpeed: 0.5,
      hidingVisibility: 0.5,
      recoilRecovery: 0.3,
    },
    rationale: {
      it: 'Sniper piu giocabile in REDSEC: pick a distanza, ma abbastanza handling per riposizionarsi.',
      en: 'More playable REDSEC sniper: ranged picks with enough handling to reposition.',
    },
  },
  // "mobile carbine flex": preserve ADS/movement while adding enough control and velocity.
  'mobile-flex': {
    id: 'mobile-flex',
    label: { it: 'Flex mobile', en: 'Mobile flex' },
    weights: {
      adsTimeTier: 0.8,
      recoilControl: 0.7,
      projectileVelocity: 0.6,
      adsMovingAccuracy: 0.6,
      hipfire: 0.4,
    },
    rationale: {
      it: 'Mantiene mobilita da carabina senza sacrificare troppo controllo e range utile.',
      en: 'Keeps carbine mobility without giving up too much control and effective range.',
    },
  },
  // "closed endings": hipfire and fast entry handling dominate building clears.
  'building-clear': {
    id: 'building-clear',
    label: { it: 'Building clear', en: 'Building clear' },
    weights: {
      hipfire: 1,
      adsTimeTier: 0.7,
      drawSpeed: 0.6,
      hidingVisibility: 0.4,
    },
    rationale: {
      it: 'Solo per finali chiusi: massimizza close pressure e clear di edifici.',
      en: 'Only for closed endings: maximizes close pressure and building clears.',
    },
  },
  // "backup": draw speed first, then close utility.
  'emergency-backup': {
    id: 'emergency-backup',
    label: { it: 'Backup emergenza', en: 'Emergency backup' },
    weights: {
      drawSpeed: 1,
      hipfire: 0.7,
      adsTimeTier: 0.5,
    },
    rationale: {
      it: 'Sidearm trattata come backup: costo basso, draw/close utility, nessuna falsa promessa REDSEC.',
      en: 'Sidearm treated as backup: low cost, draw/close utility, no false REDSEC promise.',
    },
  },
  // Conservative fallback for unmapped weapon categories.
  balanced: {
    id: 'balanced',
    label: { it: 'Bilanciata', en: 'Balanced' },
    weights: {
      recoilControl: 0.6,
      recoilPrecision: 0.5,
      adsTimeTier: 0.5,
      hipfire: 0.3,
      projectileVelocity: 0.3,
    },
    rationale: {
      it: 'Fallback bilanciato quando la classe non e mappata.',
      en: 'Balanced fallback when the class is not mapped.',
    },
  },
}

export const categoryArchetypeIds: Record<string, ArchetypeId> = {
  assaultRifle: 'mid-control',
  carbine: 'mobile-flex',
  smg: 'close-redsec',
  lmg: 'anchor-sustain',
  dmr: 'info-range',
  sniper: 'mobile-pick',
  shotgun: 'building-clear',
  sidearm: 'emergency-backup',
}

export function archetypeForCategory(categoryKey: string) {
  return archetypeProfiles[categoryArchetypeIds[categoryKey] ?? 'balanced']
}

export function inferAttachmentSlot(name: string): AttachmentSlot | undefined {
  const value = name.toLowerCase()
  if (value.includes('suppressor') || value.includes('brake') || value.includes('compensator') || value.includes('hider')) return 'muzzle'
  if (value.includes('barrel')) return 'barrel'
  if (value.includes('vertical') || value.includes('stubby') || value.includes('angled') || value.includes('handstop')) return 'underbarrel'
  if (value.includes('laser')) return 'laser'
  return undefined
}

export function scarcityMultiplier(weapon: WeaponInputForSolver, key: EffectKey) {
  if (recoilEffects.has(key)) {
    if (weapon.control !== undefined && weapon.control < 50) return 1.3
    if (weapon.control !== undefined && weapon.control > 70) return 0.7
    return 1
  }

  if (adsEffects.has(key)) {
    if (weapon.adsMs !== undefined && weapon.adsMs > 320) return 1.3
    if (weapon.adsMs !== undefined && weapon.adsMs < 260) return 0.7
    return 1
  }

  return 1
}

export function solveBuild(
  weapon: WeaponInputForSolver,
  archetype: ArchetypeProfile,
  attachments: SolverAttachment[],
  budgetCap = 100,
): SolvedBuild {
  const optionsBySlot = groupOptionsBySlot(attachments)
  const candidates = enumerateCandidates(weapon, archetype, optionsBySlot, budgetCap)

  if (candidates.length === 0) {
    return emptyBuild(weapon.weaponId, archetype.id)
  }

  const denominator = objectiveDenominator(weapon, archetype, candidates)
  for (const candidate of candidates) {
    candidate.objectiveScore = normalizeObjective(candidate.objectiveRaw, denominator)
  }

  candidates.sort(compareCandidates)
  const winner = candidates[0]
  const runnerUp = candidates[1]

  return {
    weaponId: weapon.weaponId,
    archetype: archetype.id,
    attachments: winner.attachments,
    totalPoints: winner.totalPoints,
    objectiveScore: winner.objectiveScore,
    effectTotals: winner.effectTotals,
    rationaleData: {
      chosenJustification: attachmentSlots.map((slot) =>
        explainSlotChoice(slot, winner, optionsBySlot[slot], candidates, weapon, archetype, budgetCap),
      ),
      rejectedTopRunnerUp: runnerUp ? explainRunnerUp(winner, runnerUp) : undefined,
    },
  }
}

function groupOptionsBySlot(attachments: SolverAttachment[]) {
  const groups = Object.fromEntries(
    attachmentSlots.map((slot) => [slot, [emptySlotOption(slot)] as SolverOption[]]),
  ) as Record<AttachmentSlot, SolverOption[]>

  for (const attachment of attachments) {
    groups[attachment.slot].push(attachment)
  }

  for (const slot of attachmentSlots) {
    groups[slot].sort((a, b) => Number(Boolean(a.empty)) - Number(Boolean(b.empty)) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    groups[slot].sort((a, b) => Number(Boolean(b.empty)) - Number(Boolean(a.empty)) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
  }

  return groups
}

function emptySlotOption(slot: AttachmentSlot): SolverOption {
  return {
    id: `NO_${slot.toUpperCase()}`,
    name: `No ${slot}`,
    slot,
    pointCost: 0,
    effects: {},
    empty: true,
  }
}

function enumerateCandidates(
  weapon: WeaponInputForSolver,
  archetype: ArchetypeProfile,
  optionsBySlot: Record<AttachmentSlot, SolverOption[]>,
  budgetCap: number,
) {
  const candidates: CandidateBuild[] = []
  const selected: SolverOption[] = []

  function visit(slotIndex: number) {
    if (slotIndex === attachmentSlots.length) {
      const totalPoints = selected.reduce((sum, attachment) => sum + attachment.pointCost, 0)
      if (totalPoints > budgetCap) return

      const attachments = selected.filter((attachment): attachment is SolverAttachment => !attachment.empty)
      const effectTotals = sumEffects(attachments)
      const objectiveRaw = rawObjective(weapon, archetype, effectTotals)
      const sortKey = selected.map((option) => option.id).join('|')

      candidates.push({
        options: [...selected],
        attachments,
        totalPoints,
        effectTotals,
        objectiveRaw,
        objectiveScore: 0,
        sortKey,
      })
      return
    }

    const slot = attachmentSlots[slotIndex]
    for (const option of optionsBySlot[slot]) {
      selected.push(option)
      visit(slotIndex + 1)
      selected.pop()
    }
  }

  visit(0)
  return candidates
}

function sumEffects(attachments: SolverAttachment[]): EffectVector {
  const totals: Record<string, number> = {}

  for (const attachment of attachments) {
    for (const key of effectKeys) {
      const value = attachment.effects[key]
      if (value === undefined) continue
      totals[key] = (totals[key] ?? 0) + value
    }
  }

  return totals
}

function rawObjective(weapon: WeaponInputForSolver, archetype: ArchetypeProfile, effectTotals: EffectVector) {
  return effectKeys.reduce((sum, key) => {
    const weight = archetype.weights[key] ?? 0
    const scarcityWeight = archetype.scarcityWeights?.[key] ?? 1
    const effect = effectTotals[key] ?? 0
    return sum + effect * weight * scarcityWeight * scarcityMultiplier(weapon, key)
  }, 0)
}

function objectiveDenominator(weapon: WeaponInputForSolver, archetype: ArchetypeProfile, candidates: CandidateBuild[]) {
  return effectKeys.reduce((sum, key) => {
    const weight = archetype.weights[key] ?? 0
    if (weight <= 0) return sum

    const maxEffect = Math.max(0, ...candidates.map((candidate) => candidate.effectTotals[key] ?? 0))
    return sum + maxEffect * weight * (archetype.scarcityWeights?.[key] ?? 1) * scarcityMultiplier(weapon, key)
  }, 0)
}

function normalizeObjective(raw: number, denominator: number) {
  if (denominator <= 0) return 0
  return clamp(Math.round((raw / denominator) * 100), 0, 100)
}

function explainSlotChoice(
  slot: AttachmentSlot,
  winner: CandidateBuild,
  slotOptions: SolverOption[],
  candidates: CandidateBuild[],
  weapon: WeaponInputForSolver,
  archetype: ArchetypeProfile,
  budgetCap: number,
) {
  const picked = winner.options.find((option) => option.slot === slot) ?? emptySlotOption(slot)
  const alternativesConsidered = slotOptions.filter((option) => option.id !== picked.id && !option.empty).length

  if (picked.empty) {
    const fixedCost = winner.options
      .filter((option) => option.slot !== slot)
      .reduce((sum, option) => sum + option.pointCost, 0)
    const affordableRealOptions = slotOptions.filter((option) => !option.empty && fixedCost + option.pointCost <= budgetCap)
    const bestSameSlot = candidates
      .filter((candidate) => candidate.options.every((option) => option.slot === slot || winner.options.some((pickedOption) => pickedOption.slot === option.slot && pickedOption.id === option.id)))
      .sort(compareCandidates)[0]
    const reason =
      affordableRealOptions.length === 0
        ? `${slot} slot empty: budget exhausted by stronger picks`
        : bestSameSlot?.options.find((option) => option.slot === slot)?.empty
          ? `${slot} slot empty: no attachment improved objective within budget`
          : `${slot} slot empty: preserves stronger full-combo objective`

    return {
      attachmentId: picked.id,
      reason,
      alternativesConsidered,
    }
  }

  const primary = primaryEffectDriver(picked, weapon, archetype)
  return {
    attachmentId: picked.id,
    reason: primary ? `primary ${primary.key} driver (+${primary.effect} pts)` : `best legal ${slot} fit within budget`,
    alternativesConsidered,
  }
}

function primaryEffectDriver(attachment: SolverAttachment, weapon: WeaponInputForSolver, archetype: ArchetypeProfile) {
  const drivers = effectKeys
    .map((key) => {
      const effect = attachment.effects[key] ?? 0
      const contribution = effect * (archetype.weights[key] ?? 0) * (archetype.scarcityWeights?.[key] ?? 1) * scarcityMultiplier(weapon, key)
      return { key, effect, contribution }
    })
    .filter((driver) => driver.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution || b.effect - a.effect || a.key.localeCompare(b.key))

  return drivers[0]
}

function explainRunnerUp(winner: CandidateBuild, runnerUp: CandidateBuild) {
  const changed = attachmentSlots
    .map((slot) => {
      const winnerOption = winner.options.find((option) => option.slot === slot)
      const runnerOption = runnerUp.options.find((option) => option.slot === slot)
      return winnerOption?.id === runnerOption?.id ? undefined : { slot, option: runnerOption }
    })
    .find((value): value is { slot: AttachmentSlot; option: SolverOption | undefined } => Boolean(value))
  const scoreDelta = Math.max(0, winner.objectiveScore - runnerUp.objectiveScore)
  const attachmentId = changed?.option?.id ?? runnerUp.options[0]?.id ?? 'UNKNOWN'
  const slot = changed?.slot ?? runnerUp.options[0]?.slot ?? 'muzzle'
  const reason =
    scoreDelta > 0
      ? `lower objective score by ${scoreDelta} points`
      : `lost deterministic tie-breaker against lower-cost or earlier stable option`

  return {
    attachmentId,
    slot,
    whyNotPicked: reason,
  }
}

function compareCandidates(a: CandidateBuild, b: CandidateBuild) {
  return (
    b.objectiveRaw - a.objectiveRaw ||
    b.objectiveScore - a.objectiveScore ||
    a.totalPoints - b.totalPoints ||
    a.sortKey.localeCompare(b.sortKey)
  )
}

function emptyBuild(weaponId: string, archetype: ArchetypeId): SolvedBuild {
  return {
    weaponId,
    archetype,
    attachments: [],
    totalPoints: 0,
    objectiveScore: 0,
    effectTotals: {},
    rationaleData: {
      chosenJustification: attachmentSlots.map((slot) => ({
        attachmentId: `NO_${slot.toUpperCase()}`,
        reason: `${slot} slot empty: no attachment input`,
        alternativesConsidered: 0,
      })),
    },
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
