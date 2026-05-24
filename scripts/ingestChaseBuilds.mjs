import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { generatedAttachmentData } from '../src/generated/attachmentData.ts'
import { consensusBuilds } from '../src/generated/consensusBuilds.ts'
import { generatedWeaponStats } from '../src/generated/weaponStats.ts'
import { consensusSlotMapping } from '../src/slotAuthority.ts'

const SHEET_ID = process.env.BF6_CHASE_SHEET_ID ?? '10soga9S1xoksCx2JmvmYjNYm14HblE4uE2XLFRagpnk'
const SHEET_GID = process.env.BF6_CHASE_SHEET_GID ?? '0'
const SOURCE_URL =
  process.env.BF6_CHASE_SHEET_URL ?? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
const DISPLAY_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${SHEET_GID}#gid=${SHEET_GID}`
const OUTPUT_PATH = resolve('src/generated/chaseBuilds.ts')

const columnSlots = [
  { header: 'Muzzle', slotType: 'Muzzle', slot: 'muzzle' },
  { header: 'Right Accessory', slotType: 'Right Accessory', slot: 'rightAccessory' },
  { header: 'Top Accessory', slotType: 'Top Accessory', slot: 'topAccessory' },
  { header: 'Optic', slotType: 'Scope', slot: 'optic' },
  { header: 'Optic Accessory', slotType: 'Optic Accessory', slot: 'opticAccessory' },
  { header: 'Ergonomics ', slotType: 'Ergonomics', slot: 'ergonomics' },
  { header: 'Ammo', slotType: 'Ammunition', slot: 'ammo' },
  { header: 'Mag', slotType: 'Magazine', slot: 'magazine' },
  { header: 'Underbarrel', slotType: 'Underbarrel', slot: 'underbarrel' },
  { header: 'Left Accessory', slotType: 'Left Accessory', slot: 'leftAccessory' },
  { header: 'Barrel', slotType: 'Barrel', slot: 'barrel' },
]

const categoryNames = new Set([
  'ASSAULT RIFLES',
  'CARBINES',
  'SMGS',
  'LMGS',
  'DMRS M4A1',
  'DMRS',
  'SNIPERS',
  'SHOTGUNS',
  'SECONDARIES',
])

const sourceWeaponAliases = new Map([
  ['KORD6P67', 'KORD6P67'],
  ['AK205', 'AK205'],
  ['SVK86', 'SVK86'],
  ['MINISCOUT', 'MINISCOUT'],
  ['185KSK', '185KSK'],
  ['M357', 'M357TRAIT'],
  ['VZ61', 'VZ61'],
])

const attachmentAliases = new Map([
  ['muzzle:STANDARDSUPPRESOR', 'STANDARD SUPPRESSOR'],
  ['muzzle:STANDARDSUPPRESSOR', 'STANDARD SUPPRESSOR'],
  ['muzzle:LIGHTENEDSUPPRESOR', 'LIGHTENED SUPPRESSOR'],
  ['muzzle:LIGHTENEDSUPPRESSOR', 'LIGHTENED SUPPRESSOR'],
  ['muzzle:LONGSUPPRESSOR', 'LONG SUPPRESSOR'],
  ['muzzle:CQBSUPPRESSOR', 'CQB SUPPRESSOR'],
  ['muzzle:DOUBLEPORTBRAKE', 'DOUBLE-PORT BRAKE'],
  ['muzzle:FLASHHIDER', 'FLASH HIDER'],
  ['muzzle:LINEARCOMP', 'LINEAR COMP'],
  ['muzzle:COMPENSATEDBRAKE', 'COMPENSATED BRAKE'],

  ['optic:BASICSIGHT', 'IRON SIGHTS'],
  ['optic:BASICSIGHT2ND', 'IRON SIGHTS'],
  ['optic:MINIFLEX100X', 'MINI FLEX 1.00X'],
  ['optic:ROM175X', 'RO-M 1.75X'],
  ['optic:BF2M250X', 'BF-2M 2.50X'],
  ['optic:GRIM150X', 'GRIM 1.50X'],
  ['optic:LDS450X', 'LDS 4.50X'],
  ['optic:TSHD600X', 'TS-HD 6.00X'],
  ['optic:NFX800X', 'NFX 8.00X'],

  ['opticAccessory:ANTIGLARE', 'ANTI-GLARE COATING'],
  ['ergonomics:MAGCATCH', 'IMPROVED MAG CATCH'],
  ['ergonomics:RAILCOVER', 'RAIL COVER'],

  ['ammo:STANDARD', 'STANDARD'],
  ['ammo:FMJ', 'FMJ'],
  ['ammo:HOLLOWPOINT', 'HOLLOW POINT'],
  ['ammo:SYNTHETIC', 'SYNTHETIC TIP'],
  ['ammo:LIGHTWEIGHT', 'LIGHTWEIGHT'],
  ['ammo:LONGRANGE', 'LONG RANGE'],
  ['ammo:BUCKSHOT', 'BUCKSHOT'],

  ['magazine:4RND', '4 RND'],
  ['magazine:5RND', '5RND MAGAZINE'],
  ['magazine:6RND', '6RND SPEEDLOADER'],
  ['magazine:7RND', '7 SHELL TUBE'],
  ['magazine:8FAST', '8RND SPEEDLOADER'],
  ['magazine:8RND', '8RND SPEEDLOADER'],
  ['magazine:10RND', '10RND MAGAZINE'],
  ['magazine:20RND', '20RND MAGAZINE'],
  ['magazine:20FAST', '20RND FAST MAG'],
  ['magazine:25RND', '25RND MAGAZINE'],
  ['magazine:25FAST', '25 FAST'],
  ['magazine:30RND', '30RND MAGAZINE'],
  ['magazine:30FAST', '30RND FAST MAG'],
  ['magazine:36RND', '36 RND'],
  ['magazine:40RND', '40RND MAGAZINE'],
  ['magazine:40FAST', '40RND FAST MAG'],
  ['magazine:45RND', '45RND MAGAZINE'],
  ['magazine:45FAST', '45RND FAST MAG'],
  ['magazine:50RND', '50 RND MAGAZINE'],
  ['magazine:50FAST', '50RND BELT POUCH'],
  ['magazine:60FAST', '60RND MAGAZINE'],
  ['magazine:75RND', '75RND BELT BOX'],
  ['magazine:100RND', '100 RND'],

  ['underbarrel:6H64VERTICAL', '6H64 VERTICAL'],
  ['underbarrel:ALLOYVERTICAL', 'ALLOY VERTICAL'],
  ['underbarrel:RIBBEDVERTICAL', 'RIBBED VERTICAL'],
  ['underbarrel:FOLDINGVERTICAL', 'FOLDING VERTICAL'],
  ['underbarrel:CLASSICVERTICAL', 'CLASSIC VERTICAL'],
  ['underbarrel:RIBBEDSTUBBY', 'RIBBED STUBBY'],
  ['underbarrel:SLIMHANDSTOP', 'SLIM HANDSTOP'],
  ['underbarrel:SLIMANGLED', 'SLIM ANGLED'],
  ['underbarrel:FULLANGLED', 'FULL ANGLED'],
  ['underbarrel:LOWPROFILESTUBBY', 'LOW-PROFILE STUBBY'],
  ['underbarrel:BASIC', 'BASIC'],
  ['underbarrel:LASERLIGHTGREEN', '5 MW GREEN'],
  ['leftAccessory:TACLIGHTAIMED', 'TACLIGHT - AIMED'],

  ['barrel:BASIC', 'BASIC'],
  ['barrel:LIGHT', 'LIGHT'],
  ['barrel:EXTENDED', 'EXTENDED'],
  ['barrel:HEAVY', 'HEAVY BARREL'],
  ['barrel:HEAVYEXT', 'HEAVY EXTENDED BARREL'],
  ['barrel:HEAVYEXTENDED', 'HEAVY EXTENDED BARREL'],
])

const manualCostFallbacks = new Map([
  ['ammo:STANDARD', { pointCost: 0, costSource: 'default-zero' }],
  ['ammo:LONG RANGE', { pointCost: 5, costSource: 'community-cost-reference' }],
  ['ammo:LIGHTWEIGHT', { pointCost: 0, costSource: 'default-zero' }],
  ['optic:TS-HD 6.00X', { pointCost: 10, costSource: 'scope-family-inference' }],
  ['optic:NFX 8.00X', { pointCost: 10, costSource: 'scope-family-inference' }],
  ['optic:LDS 4.50X', { pointCost: 10, costSource: 'scope-family-inference' }],
  ['leftAccessory:TACLIGHT - AIMED', { pointCost: 5, costSource: 'battlefield-wiki-cost-reference' }],
])

function parseCsv(input) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        value += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(value)
      value = ''
    } else if (char === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else if (char !== '\r') {
      value += char
    }
  }

  if (value || row.length > 0) {
    row.push(value)
    rows.push(row)
  }

  return rows
}

function normalizeToken(value) {
  return String(value ?? '')
    .toUpperCase()
    .replace(/SUPPRESOR/g, 'SUPPRESSOR')
    .replace(/VOILET/g, 'VIOLET')
    .replace(/[^A-Z0-9]+/g, '')
}

function normalizeWeaponName(value) {
  const token = normalizeToken(value)
  return sourceWeaponAliases.get(token) ?? token
}

function prettyAttachmentName(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/Suppresor/gi, 'Suppressor')
    .replace(/Voilet/gi, 'Violet')
    .replace(/\bExt\b/gi, 'Extended')
    .replace(/\bhandstop\b/gi, 'Handstop')
}

function normalizedLookupName(value, slot) {
  const token = normalizeToken(value)
  return attachmentAliases.get(`${slot}:${token}`) ?? prettyAttachmentName(value).toUpperCase()
}

function lookupKey(slot, name) {
  return `${slot}:${normalizeToken(name)}`
}

function addLookup(lookup, slot, name, pointCost, source) {
  if (pointCost === undefined || pointCost === null) return
  const key = lookupKey(slot, name)
  if (!lookup.has(key)) lookup.set(key, { pointCost, source })
}

function buildAttachmentLookup() {
  const lookup = new Map()
  const byWeapon = new Map()

  for (const attachment of generatedAttachmentData.attachments) {
    addLookup(lookup, attachment.slot, attachment.name, attachment.pointCost, attachment.source ?? 'attachmentData')
  }

  for (const [weaponName, build] of Object.entries(consensusBuilds.builds)) {
    const weaponLookup = new Map()
    for (const variant of Object.values(build.variants)) {
      for (const attachment of variant.attachments) {
        const slot = consensusSlotMapping[attachment.slotType]
        if (!slot) continue
        addLookup(weaponLookup, slot, attachment.name, attachment.pointCost, 'battlefieldmeta.gg weapon page')
        addLookup(lookup, slot, attachment.name, attachment.pointCost, 'battlefieldmeta.gg')
      }
    }
    byWeapon.set(normalizeWeaponName(weaponName), weaponLookup)
  }

  // Accessory lasers in Chase's sheet are named by color and mW; the public
  // attachment sheet exposes Violet as the generic laser slot rather than the
  // top/right/left accessory slots used by BattlefieldMeta pages.
  for (const slot of ['rightAccessory', 'topAccessory', 'leftAccessory', 'underbarrel']) {
    addLookup(lookup, slot, '50 MW VIOLET LASER', 10, 'public-attachment-sheet')
    addLookup(lookup, slot, '50 MW BLUE LASER', 20, 'battlefieldmeta.gg')
    addLookup(lookup, slot, '120 MW BLUE LASER', 30, 'battlefieldmeta.gg')
    addLookup(lookup, slot, '5 MW GREEN LASER', 10, 'battlefieldmeta.gg')
    addLookup(lookup, slot, 'FLASHLIGHT', 10, 'battlefieldmeta.gg')
  }

  for (const [key, value] of manualCostFallbacks) {
    lookup.set(lookupKey(...key.split(':')), value)
  }

  return { global: lookup, byWeapon }
}

function canonicalWeaponNames() {
  return new Map(generatedWeaponStats.weapons.map((weapon) => [normalizeWeaponName(weapon.name), weapon.name]))
}

function parseWeaponCell(value) {
  const text = String(value ?? '').trim()
  const match = text.match(/^(.*?)\s*\(as of\s*(\d{1,2})\/(\d{1,2})\/(\d{2})\)\s*$/i)
  if (!match) return undefined

  const [, sourceName, month, day, year] = match
  const fullYear = Number(year) < 70 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`

  return {
    sourceName: sourceName.trim(),
    asOf: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
  }
}

function rowCategory(value) {
  const text = String(value ?? '').trim().toUpperCase()
  if (!text || !categoryNames.has(text)) return undefined
  if (text.startsWith('ASSAULT')) return 'Assault Rifles'
  if (text === 'CARBINES') return 'Carbines'
  if (text === 'SMGS') return 'SMGs'
  if (text === 'LMGS') return 'LMGs'
  if (text.startsWith('DMRS')) return 'DMRs'
  if (text === 'SNIPERS') return 'Snipers'
  if (text === 'SHOTGUNS') return 'Shotguns'
  if (text === 'SECONDARIES') return 'Secondaries'
  return text
}

function readChaseRows(rows, lookups) {
  const headers = rows[0] ?? []
  const headerIndex = new Map(headers.map((header, index) => [header, index]))
  const names = canonicalWeaponNames()
  const builds = {}
  const skippedRows = []
  const unresolved = []
  let category = ''

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    const first = String(row[0] ?? '').trim()
    const maybeCategory = rowCategory(first)
    if (maybeCategory) {
      category = maybeCategory
      continue
    }

    const parsed = parseWeaponCell(first)
    if (!parsed) {
      if (first && !first.includes('????') && !first.toLowerCase().includes("don't use")) {
        skippedRows.push({ rowNumber: rowIndex + 1, value: first })
      }
      continue
    }

    const canonicalWeaponName = names.get(normalizeWeaponName(parsed.sourceName))
    if (!canonicalWeaponName) {
      skippedRows.push({ rowNumber: rowIndex + 1, value: first, reason: 'weapon not in generatedWeaponStats' })
      continue
    }

    const attachments = []

    for (const column of columnSlots) {
      const cell = row[headerIndex.get(column.header)]
      if (!cell || !String(cell).trim()) continue

      const sourceName = prettyAttachmentName(cell)
      const canonicalName = normalizedLookupName(sourceName, column.slot)
      const weaponLookup = lookups.byWeapon.get(normalizeWeaponName(canonicalWeaponName))
      const lookupResult =
        weaponLookup?.get(lookupKey(column.slot, canonicalName)) ??
        weaponLookup?.get(lookupKey(column.slot, sourceName)) ??
        lookups.global.get(lookupKey(column.slot, canonicalName)) ??
        lookups.global.get(lookupKey(column.slot, sourceName))
      const fallback = manualCostFallbacks.get(`${column.slot}:${canonicalName}`)
      const pointCost = lookupResult?.pointCost ?? fallback?.pointCost
      const costKnown = pointCost !== undefined

      if (!costKnown) {
        unresolved.push({
          weaponName: canonicalWeaponName,
          sourceName,
          slot: column.slot,
          rowNumber: rowIndex + 1,
        })
      }

      attachments.push({
        id: `${column.slot.toUpperCase()}_${normalizeToken(canonicalName || sourceName)}`,
        name: sourceName,
        canonicalName,
        slot: column.slot,
        slotType: column.slotType,
        pointCost: pointCost ?? 0,
        pointCostKnown: costKnown,
        costSource: lookupResult?.source ?? fallback?.costSource ?? 'unresolved',
        sourceColumn: column.header.trim(),
      })
    }

    builds[canonicalWeaponName] = {
      weaponName: canonicalWeaponName,
      sourceWeaponName: parsed.sourceName,
      category,
      asOf: parsed.asOf,
      sourceRow: rowIndex + 1,
      sourceUrl: DISPLAY_URL,
      attachments,
      totalKnownPoints: attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0),
      hasUnknownPointCosts: attachments.some((attachment) => !attachment.pointCostKnown),
    }
  }

  return { builds, skippedRows, unresolved }
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2)
}

async function main() {
  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch Chasenoface REDSEC sheet: ${response.status} ${response.statusText}`)
  }

  const csv = await response.text()
  const rows = parseCsv(csv)
  const lookup = buildAttachmentLookup()
  const { builds, skippedRows, unresolved } = readChaseRows(rows, lookup)
  const sourceHash = createHash('sha256').update(csv).digest('hex').slice(0, 16)

  const dataset = {
    schemaVersion: 1,
    source: 'Chasenoface Battlefield Redsec Builds',
    sourceUrl: DISPLAY_URL,
    csvUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    sourceHash,
    buildCount: Object.keys(builds).length,
    builds,
    skippedRows,
    unresolved,
  }

  const file = `// Generated by scripts/ingestChaseBuilds.mjs. Do not edit by hand.\nexport const generatedChaseBuilds = ${stableStringify(dataset)} as const\n`

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, file, 'utf8')
  console.log(
    `Generated ${Object.keys(builds).length} Chasenoface REDSEC builds (${sourceHash}); ${unresolved.length} unresolved attachment costs.`,
  )
  if (skippedRows.length) console.log(`Skipped ${skippedRows.length} non-build rows.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
