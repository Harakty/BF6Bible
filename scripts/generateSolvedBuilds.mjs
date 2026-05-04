import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { archetypeForCategory, inferAttachmentSlot, solveBuild } from '../src/buildSolver.ts'
import { consensusBuilds } from '../src/generated/consensusBuilds.ts'
import { consensusSlotMapping, isLayerASlot, isLayerBSlot, layerASlots } from '../src/slotAuthority.ts'

const WEAPON_DATA_PATH = resolve('src/generated/weaponStats.ts')
const ATTACHMENT_DATA_PATH = resolve('src/generated/attachmentData.ts')
const OUTPUT_PATH = resolve('src/generated/solvedBuilds.ts')

const localizedNames = {
  'Flash Hider': 'Spegnifiamma',
  'Flash Compensator': 'Compensatore di vampa',
  'Single-Port Brake': 'Freno a singola porta',
  'Double-Port Brake': 'Freno a doppia porta',
  'Compensated Brake': 'Freno compensato',
  'Linear Compensator': 'Compensatore lineare',
  'Standard Suppressor': 'Silenziatore standard',
  'Long Suppressor': 'Silenziatore lungo',
  'CQB Suppressor': 'Silenziatore CQB',
  'Light Suppressor': 'Silenziatore alleggerito',
  'Basic Barrel': 'Canna base',
  'Heavy Barrel': 'Canna pesante',
  'Extended Barrel': 'Canna allungata',
  'Heavy Extended Barrel': 'Canna pesante allungata',
  'Short Barrel': 'Canna corta',
  'Light Barrel': 'Canna leggera',
  'Folding Vertical': 'Verticale pieghevole',
  'Alloy Vertical': 'Verticale in lega',
  'Ribbed Vertical': 'Verticale scanalata',
  '6h64 Vertical': '6H64 verticale',
  'Classic Vertical': 'Classica verticale',
  'Folding Stubby': 'Stubby pieghevole',
  'Ribbed Stubby': 'Stubby scanalata',
  'Canted Stubby': 'Stubby inclinata',
  'Stippled Stubby': 'Stubby zigrinata',
  'Low-Profile Stubby': 'Stubby a basso profilo',
  'Slim Handstop': 'Handstop sottile',
  'Adjustable Angled': 'Angolata regolabile',
  'Slim Angled': 'Angolata sottile',
  'Full Angled': 'Angolata piena',
  'Red Laser (5 mW)': 'Laser rosso (5 mW)',
  'Violet Laser (50 mW)': 'Laser viola (50 mW)',
  'Green Laser (5 mW)': 'Laser verde (5 mW)',
  'Green Laser (50 mW)': 'Laser verde (50 mW)',
  'Blue Laser (50 mW)': 'Laser blu (50 mW)',
  'Blue Laser (120 mW)': 'Laser blu (120 mW)',
}

function extractGeneratedObject(text, exportName) {
  const marker = `export const ${exportName} = `
  const start = text.indexOf(marker)
  if (start === -1) throw new Error(`Missing export ${exportName}`)
  const jsonStart = start + marker.length
  const jsonEnd = text.lastIndexOf(' as const')
  if (jsonEnd === -1 || jsonEnd <= jsonStart) throw new Error(`Cannot parse ${exportName}`)
  return JSON.parse(text.slice(jsonStart, jsonEnd))
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2)
}

function normalizeWeaponName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function normalizeUrlSlug(sourceUrl) {
  const slug = sourceUrl?.split('/').filter(Boolean).at(-1)
  return slug ? normalizeWeaponName(slug) : undefined
}

function solverAttachmentFromGenerated(attachment) {
  const slot = attachment.slot ?? inferAttachmentSlot(attachment.name)
  if (!slot) throw new Error(`Cannot infer attachment slot for ${attachment.name}`)

  return {
    id: attachment.id,
    name: attachment.name,
    slot,
    pointCost: attachment.pointCost,
    effects: attachment.effects ?? {},
    layer: attachment.layer ?? 'A',
    source: attachment.source,
    sourceUrl: attachment.sourceUrl,
  }
}

function localizedAttachment(attachment) {
  return {
    id: attachment.id,
    slot: attachment.slot,
    name: {
      it: localizedNames[attachment.name] ?? attachment.name,
      en: attachment.name,
    },
    points: attachment.pointCost,
    pointCost: attachment.pointCost,
    effects: attachment.effects ?? {},
    layer: attachment.layer ?? 'A',
    source: attachment.source ?? 'public-csv',
    sourceUrl: attachment.sourceUrl,
  }
}

function allowedSlotsForWeapon(weapon) {
  if (weapon.categoryKey === 'sidearm') return new Set(['muzzle', 'barrel'])
  return new Set(layerASlots)
}

function attachmentsForWeapon(weapon, solverAttachments) {
  const allowedSlots = allowedSlotsForWeapon(weapon)

  // The public attachment sheet does not expose a per-weapon compatibility matrix yet.
  // Keep obvious category constraints local to generation so the pure solver stays generic.
  return solverAttachments.filter((attachment) => attachment.layer === 'A' && isLayerASlot(attachment.slot) && allowedSlots.has(attachment.slot))
}

function canonicalConsensusSlot(attachment) {
  const slot = consensusSlotMapping[attachment.slotType]
  if (!slot) throw new Error(`Cannot map consensus slot "${attachment.slotType}" for ${attachment.name}`)
  return slot
}

function localizedConsensusAttachment(attachment) {
  const slot = canonicalConsensusSlot(attachment)
  return {
    id: `${slot.toUpperCase()}_${attachment.name.replace(/[^A-Za-z0-9]+/g, '').toUpperCase()}`,
    slot,
    name: {
      it: attachment.name,
      en: attachment.name,
    },
    points: attachment.pointCost,
    pointCost: attachment.pointCost,
    effects: {},
    layer: 'B',
    source: 'battlefieldmeta.gg',
    sourceUrl: attachment.sourceUrl,
    fetchTimestamp: attachment.fetchTimestamp,
    unlockLevel: attachment.unlockLevel,
  }
}

function recommendedVariantForConsensus(weaponName, consensus) {
  const recommended = consensus.variants?.Recommended
  if (!recommended) throw new Error(`${weaponName}: missing Recommended consensus variant`)
  return recommended
}

function layerBAttachmentsFromVariant(variant) {
  return variant.attachments.filter((attachment) => isLayerBSlot(canonicalConsensusSlot(attachment)))
}

function alternativeVariantsFromConsensus(consensus) {
  return Object.entries(consensus.variants)
    .filter(([variantName]) => variantName !== 'Recommended')
    .map(([, variant]) => ({
      variantId: variant.variantId,
      variantLabel: variant.variantLabel,
      attachments: variant.attachments.map(localizedConsensusAttachment),
      totalPoints: variant.totalPoints,
    }))
}

function sumPoints(attachments) {
  return attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)
}

function sumEffectTotals(attachments) {
  const totals = {}
  for (const attachment of attachments) {
    for (const [key, value] of Object.entries(attachment.effects ?? {})) {
      totals[key] = (totals[key] ?? 0) + value
    }
  }
  return totals
}

function weightedUtility(attachments, archetype) {
  const totals = sumEffectTotals(attachments)
  return Object.entries(totals).reduce((sum, [key, value]) => sum + value * (archetype.weights[key] ?? 0), 0)
}

function enumerateLayerACombos(attachments, allowedSlots) {
  const slots = [...allowedSlots]
  const optionsBySlot = new Map(slots.map((slot) => [slot, [undefined, ...attachments.filter((attachment) => attachment.slot === slot)]]))
  const selected = []
  const combos = []

  function visit(slotIndex) {
    if (slotIndex === slots.length) {
      combos.push(selected.filter(Boolean))
      return
    }

    const slot = slots[slotIndex]
    for (const option of optionsBySlot.get(slot) ?? [undefined]) {
      selected.push(option)
      visit(slotIndex + 1)
      selected.pop()
    }
  }

  visit(0)
  return combos
}

function exactLayerACombo(weapon, archetype, attachments, solved, budgetCap) {
  const allowedSlots = allowedSlotsForWeapon(weapon)
  const solvedIds = new Set(solved.attachments.map((attachment) => attachment.id))
  const candidates = enumerateLayerACombos(attachments, allowedSlots)
    .filter((combo) => sumPoints(combo) === budgetCap)
    .map((combo) => ({
      attachments: combo,
      overlap: combo.filter((attachment) => solvedIds.has(attachment.id)).length,
      utility: weightedUtility(combo, archetype),
      attachmentCount: combo.length,
      sortKey: combo.map((attachment) => attachment.id).join('|'),
    }))

  candidates.sort(
    (a, b) =>
      b.attachmentCount - a.attachmentCount ||
      b.overlap - a.overlap ||
      b.utility - a.utility ||
      a.sortKey.localeCompare(b.sortKey),
  )

  return candidates[0]?.attachments
}

function solveLayerAExactly(weapon, archetype, attachments, budgetCap) {
  if (budgetCap < 0) throw new Error(`${weapon.name}: negative Layer A budget ${budgetCap}`)

  const weaponInput = {
    weaponId: weapon.id,
    categoryKey: weapon.categoryKey,
    hipfire: weapon.hipfire,
    control: weapon.control,
    precision: weapon.precision,
    mobility: weapon.mobility,
    velocity: weapon.velocity,
    adsMs: weapon.adsMs,
    rpm: weapon.rpm,
    magSize: weapon.magSize,
  }

  const solved = solveBuild(weaponInput, archetype, attachments, budgetCap)
  const exactCombo = exactLayerACombo(weapon, archetype, attachments, solved, budgetCap)
  if (solved.totalPoints === budgetCap && (!exactCombo || exactCombo.length <= solved.attachments.length)) return solved

  if (!exactCombo) {
    throw new Error(`${weapon.name}: no exact Layer A attachment combination for ${budgetCap} points; solver best was ${solved.totalPoints}`)
  }

  const exactSolved = solveBuild(weaponInput, archetype, exactCombo, budgetCap)
  if (exactSolved.totalPoints !== budgetCap) {
    throw new Error(`${weapon.name}: exact Layer A fallback produced ${exactSolved.totalPoints}/${budgetCap}`)
  }

  return exactSolved
}

async function main() {
  const [weaponText, attachmentText] = await Promise.all([
    readFile(WEAPON_DATA_PATH, 'utf8'),
    readFile(ATTACHMENT_DATA_PATH, 'utf8'),
  ])
  const weaponData = extractGeneratedObject(weaponText, 'generatedWeaponStats')
  const attachmentData = extractGeneratedObject(attachmentText, 'generatedAttachmentData')
  const solverAttachments = attachmentData.attachments.map(solverAttachmentFromGenerated)
  const consensusByNormalizedWeapon = new Map()
  for (const [weaponName, build] of Object.entries(consensusBuilds.builds)) {
    consensusByNormalizedWeapon.set(normalizeWeaponName(weaponName), { weaponName, build })
    const sourceSlug = normalizeUrlSlug(build.sourceUrl)
    if (sourceSlug) consensusByNormalizedWeapon.set(sourceSlug, { weaponName, build })
  }

  const builds = weaponData.weapons.map((weapon) => {
    const consensusMatch =
      (consensusBuilds.builds[weapon.name] && { weaponName: weapon.name, build: consensusBuilds.builds[weapon.name] }) ??
      consensusByNormalizedWeapon.get(normalizeWeaponName(weapon.name))
    const consensus = consensusMatch?.build
    if (!consensus) throw new Error(`${weapon.name}: missing battlefieldmeta consensus build`)

    const archetype = archetypeForCategory(weapon.categoryKey)
    const recommendedVariant = recommendedVariantForConsensus(weapon.name, consensus)
    const weaponMaxBudget = consensus.weaponMaxBudget
    const layerBAttachments = layerBAttachmentsFromVariant(recommendedVariant)
    const layerBTotal = sumPoints(layerBAttachments)
    const layerABudget = weaponMaxBudget - layerBTotal
    const solved = solveLayerAExactly(weapon, archetype, attachmentsForWeapon(weapon, solverAttachments), layerABudget)
    const layerAAttachments = solved.attachments.map(localizedAttachment)
    const layerBFinalAttachments = layerBAttachments.map(localizedConsensusAttachment)
    const finalAttachments = [...layerAAttachments, ...layerBFinalAttachments]
    const alternativeVariants = alternativeVariantsFromConsensus(consensus)
    const finalTotal = finalAttachments.reduce((sum, attachment) => sum + attachment.points, 0)
    if (finalTotal !== weaponMaxBudget) {
      throw new Error(`${weapon.name}: build totals ${finalTotal}/${weaponMaxBudget}, must match weapon cap exactly`)
    }

    return {
      weaponId: weapon.id,
      weaponName: weapon.name,
      categoryKey: weapon.categoryKey,
      className: weapon.className,
      slot: weapon.slot,
      status: 'solved',
      archetype: {
        id: archetype.id,
        label: archetype.label,
      },
      totalPoints: finalTotal,
      weaponMaxBudget,
      consensusWeaponName: consensusMatch.weaponName,
      layerATotal: solved.totalPoints,
      layerBTotal,
      objectiveScore: solved.objectiveScore,
      effectTotals: solved.effectTotals,
      attachments: finalAttachments,
      alternativeVariants,
      rationale: archetype.rationale,
      rationaleData: solved.rationaleData,
      sourceHashes: {
        weapons: weaponData.sourceHash,
        attachments: attachmentData.sourceHash,
        consensus: consensusBuilds.fetchedAt,
      },
    }
  })

  for (const build of builds) {
    if (build.totalPoints !== build.weaponMaxBudget) {
      throw new Error(`${build.weaponName}: build has ${build.totalPoints}/${build.weaponMaxBudget} points, must match cap exactly`)
    }
  }

  const dataset = {
    schemaVersion: 3,
    model: {
      maxPoints: 100,
      budgetMode: 'weapon-specific-consensus-cap',
      status: 'solved',
      ruleSet: 'bf6-bible-hybrid-consensus-v2-variants',
      layerA: [...layerASlots],
      layerB: 'battlefieldmeta.gg literal consensus slots',
    },
    builds,
  }

  const file = `// Generated by scripts/generateSolvedBuilds.mjs. Do not edit by hand.\nexport const generatedSolvedBuilds = ${stableStringify(dataset)} as const\n`

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, file, 'utf8')
  console.log(`Generated ${builds.length} solved builds.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
