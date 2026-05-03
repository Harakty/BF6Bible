import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { archetypeForCategory, inferAttachmentSlot, solveBuild } from '../src/buildSolver.ts'

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

function solverAttachmentFromGenerated(attachment) {
  const slot = inferAttachmentSlot(attachment.name)
  if (!slot) throw new Error(`Cannot infer attachment slot for ${attachment.name}`)

  return {
    id: attachment.id,
    name: attachment.name,
    slot,
    pointCost: attachment.pointCost,
    effects: attachment.effects,
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
    effects: attachment.effects,
  }
}

function allowedSlotsForWeapon(weapon) {
  if (weapon.categoryKey === 'sidearm') return new Set(['muzzle', 'barrel', 'laser'])
  return undefined
}

function attachmentsForWeapon(weapon, solverAttachments) {
  const allowedSlots = allowedSlotsForWeapon(weapon)
  if (!allowedSlots) return solverAttachments

  // The public attachment sheet does not expose a per-weapon compatibility matrix yet.
  // Keep obvious category constraints local to generation so the pure solver stays generic.
  return solverAttachments.filter((attachment) => allowedSlots.has(attachment.slot))
}

async function main() {
  const [weaponText, attachmentText] = await Promise.all([
    readFile(WEAPON_DATA_PATH, 'utf8'),
    readFile(ATTACHMENT_DATA_PATH, 'utf8'),
  ])
  const weaponData = extractGeneratedObject(weaponText, 'generatedWeaponStats')
  const attachmentData = extractGeneratedObject(attachmentText, 'generatedAttachmentData')
  const solverAttachments = attachmentData.attachments.map(solverAttachmentFromGenerated)

  const builds = weaponData.weapons.map((weapon) => {
    const archetype = archetypeForCategory(weapon.categoryKey)
    const solved = solveBuild(
      {
        weaponId: weapon.id,
        control: weapon.control,
        precision: weapon.precision,
        mobility: weapon.mobility,
        velocity: weapon.velocity,
        adsMs: weapon.adsMs,
      },
      archetype,
      attachmentsForWeapon(weapon, solverAttachments),
    )

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
      totalPoints: solved.totalPoints,
      objectiveScore: solved.objectiveScore,
      effectTotals: solved.effectTotals,
      attachments: solved.attachments.map(localizedAttachment),
      rationale: archetype.rationale,
      rationaleData: solved.rationaleData,
      sourceHashes: {
        weapons: weaponData.sourceHash,
        attachments: attachmentData.sourceHash,
      },
    }
  })

  const dataset = {
    schemaVersion: 1,
    model: {
      maxPoints: 100,
      status: 'solved',
      ruleSet: 'bf6-bible-redsec-solver-v1',
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
