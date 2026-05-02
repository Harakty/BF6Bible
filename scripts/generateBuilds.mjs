import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const WEAPON_DATA_PATH = resolve('src/generated/weaponStats.ts')
const ATTACHMENT_DATA_PATH = resolve('src/generated/attachmentData.ts')
const OUTPUT_PATH = resolve('src/generated/algorithmicBuilds.ts')

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

const archetypes = {
  assaultRifle: {
    id: 'mid-control',
    label: { it: 'Mid control REDSEC', en: 'REDSEC mid control' },
    targetNames: ['Light Suppressor', '6h64 Vertical', 'Extended Barrel', 'Blue Laser (120 mW)'],
    rationale: {
      it: 'Priorità a controllo, velocity e firma silenziata: build da teamfire 20-60 m.',
      en: 'Prioritizes control, velocity, and suppressed signature: 20-60 m teamfire build.',
    },
  },
  carbine: {
    id: 'mobile-flex',
    label: { it: 'Flex mobile', en: 'Mobile flex' },
    targetNames: ['Light Suppressor', '6h64 Vertical', 'Extended Barrel', 'Blue Laser (120 mW)'],
    rationale: {
      it: 'Mantiene mobilità da carabina senza sacrificare troppo controllo e range utile.',
      en: 'Keeps carbine mobility without giving up too much control and effective range.',
    },
  },
  smg: {
    id: 'close-redsec',
    label: { it: 'Close REDSEC', en: 'REDSEC close' },
    targetNames: ['Long Suppressor', 'Short Barrel', 'Low-Profile Stubby', 'Red Laser (5 mW)'],
    rationale: {
      it: 'Costruita per push sotto i 25 m: hipfire, ADS rapido e firma ridotta.',
      en: 'Built for pushes under 25 m: hipfire, fast ADS, and reduced signature.',
    },
  },
  lmg: {
    id: 'anchor-sustain',
    label: { it: 'Anchor sustain', en: 'Anchor sustain' },
    targetNames: ['Light Suppressor', 'Classic Vertical', 'Heavy Barrel', 'Blue Laser (50 mW)'],
    rationale: {
      it: 'Stabilità e pressione lane per revive cover e fight lunghi contro armor.',
      en: 'Stability and lane pressure for revive cover and long armor fights.',
    },
  },
  dmr: {
    id: 'info-range',
    label: { it: 'Info range', en: 'Info range' },
    targetNames: ['Long Suppressor', 'Heavy Barrel', 'Low-Profile Stubby', 'Blue Laser (50 mW)'],
    rationale: {
      it: 'Massimizza controllo e conversione degli armor crack a media-lunga distanza.',
      en: 'Maximizes control and conversion of armor cracks at mid-long range.',
    },
  },
  sniper: {
    id: 'mobile-pick',
    label: { it: 'Pick mobile', en: 'Mobile pick' },
    targetNames: ['Standard Suppressor', 'Heavy Extended Barrel', 'Low-Profile Stubby', 'Blue Laser (50 mW)'],
    rationale: {
      it: 'Sniper più giocabile in REDSEC: pick a distanza, ma abbastanza handling per riposizionarsi.',
      en: 'More playable REDSEC sniper: ranged picks with enough handling to reposition.',
    },
  },
  shotgun: {
    id: 'building-clear',
    label: { it: 'Building clear', en: 'Building clear' },
    targetNames: ['CQB Suppressor', 'Short Barrel', 'Low-Profile Stubby', 'Green Laser (5 mW)'],
    rationale: {
      it: 'Solo per finali chiusi: massimizza close pressure e clear di edifici.',
      en: 'Only for closed endings: maximizes close pressure and building clears.',
    },
  },
  sidearm: {
    id: 'emergency-backup',
    label: { it: 'Backup emergenza', en: 'Emergency backup' },
    targetNames: ['Light Suppressor', 'Short Barrel', 'Red Laser (5 mW)'],
    rationale: {
      it: 'Sidearm trattata come backup: costo basso, draw/close utility, nessuna falsa promessa REDSEC.',
      en: 'Sidearm treated as backup: low cost, draw/close utility, no false REDSEC promise.',
    },
  },
  unknown: {
    id: 'balanced',
    label: { it: 'Bilanciata', en: 'Balanced' },
    targetNames: ['Light Suppressor', '6h64 Vertical', 'Extended Barrel', 'Green Laser (50 mW)'],
    rationale: {
      it: 'Fallback bilanciato quando la classe non è mappata.',
      en: 'Balanced fallback when the class is not mapped.',
    },
  },
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

function normalizeId(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function attachmentSlot(name) {
  const value = name.toLowerCase()
  if (value.includes('suppressor') || value.includes('brake') || value.includes('compensator') || value.includes('hider')) return 'muzzle'
  if (value.includes('barrel')) return 'barrel'
  if (value.includes('vertical') || value.includes('stubby') || value.includes('angled') || value.includes('handstop')) return 'underbarrel'
  if (value.includes('laser')) return 'laser'
  return 'misc'
}

function pickAttachments(targetNames, attachmentByName) {
  const selected = []
  const usedSlots = new Set()
  let total = 0

  for (const targetName of targetNames) {
    const attachment = attachmentByName.get(normalizeId(targetName))
    if (!attachment) continue
    const slot = attachmentSlot(attachment.name)
    if (usedSlots.has(slot)) continue
    if (total + attachment.pointCost > 100) continue

    usedSlots.add(slot)
    total += attachment.pointCost
    selected.push({
      id: attachment.id,
      slot,
      name: {
        it: localizedNames[attachment.name] ?? attachment.name,
        en: attachment.name,
      },
      points: attachment.pointCost,
      effects: attachment.effects,
    })
  }

  return selected
}

function buildScore(weapon, totalPoints) {
  const control = weapon.control ?? 50
  const mobility = weapon.mobility ?? 50
  const precision = weapon.precision ?? 50
  const spend = Math.min(totalPoints, 100)
  return Math.round(control * 0.3 + precision * 0.24 + mobility * 0.18 + spend * 0.28)
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2)
}

async function main() {
  const [weaponText, attachmentText] = await Promise.all([
    readFile(WEAPON_DATA_PATH, 'utf8'),
    readFile(ATTACHMENT_DATA_PATH, 'utf8'),
  ])
  const weaponData = extractGeneratedObject(weaponText, 'generatedWeaponStats')
  const attachmentData = extractGeneratedObject(attachmentText, 'generatedAttachmentData')
  const attachmentByName = new Map(attachmentData.attachments.map((attachment) => [normalizeId(attachment.name), attachment]))

  const builds = weaponData.weapons.map((weapon) => {
    const archetype = archetypes[weapon.categoryKey] ?? archetypes.unknown
    const attachments = pickAttachments(archetype.targetNames, attachmentByName)
    const totalPoints = attachments.reduce((sum, attachment) => sum + attachment.points, 0)

    return {
      weaponId: weapon.id,
      weaponName: weapon.name,
      categoryKey: weapon.categoryKey,
      className: weapon.className,
      slot: weapon.slot,
      status: 'algorithmic',
      archetype: {
        id: archetype.id,
        label: archetype.label,
      },
      totalPoints,
      score: buildScore(weapon, totalPoints),
      attachments,
      rationale: archetype.rationale,
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
      status: 'algorithmic',
      ruleSet: 'bf6-bible-redsec-v1',
    },
    builds,
  }

  const file = `// Generated by scripts/generateBuilds.mjs. Do not edit by hand.\nexport const generatedAlgorithmicBuilds = ${stableStringify(dataset)} as const\n`

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, file, 'utf8')
  console.log(`Generated ${builds.length} algorithmic builds.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
