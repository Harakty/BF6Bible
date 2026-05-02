import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const SHEET_ID = process.env.BF6_WEAPON_SHEET_ID ?? '1oHVJQPfkTGIjdqnuDhNrD16GETNQCWa0aofBQOtjg9w'
const SHEET_GID = process.env.BF6_WEAPON_SHEET_GID ?? '314079070'
const SOURCE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
const OUTPUT_PATH = resolve('src/generated/weaponStats.ts')
const RANGES = [0, 10, 20, 35, 50, 70, 80]
const STANDARD_HP = 100
const REDSEC_EHP_PROXY = 180

const categoryMap = {
  ASSAULT: { key: 'assaultRifle', className: { it: "Fucile d'assalto", en: 'Assault Rifle' }, slot: 'primary' },
  CARBINES: { key: 'carbine', className: { it: 'Carabina', en: 'Carbine' }, slot: 'primary' },
  SMGS: { key: 'smg', className: { it: 'SMG', en: 'SMG' }, slot: 'primary' },
  LMGS: { key: 'lmg', className: { it: 'LMG', en: 'LMG' }, slot: 'primary' },
  DMR: { key: 'dmr', className: { it: 'DMR', en: 'DMR' }, slot: 'primary' },
  SNIPER: { key: 'sniper', className: { it: 'Cecchino', en: 'Sniper' }, slot: 'primary' },
  SHOTGUN: { key: 'shotgun', className: { it: 'Fucile a pompa', en: 'Shotgun' }, slot: 'primary' },
  SECONDARY: { key: 'sidearm', className: { it: 'Pistola', en: 'Pistol' }, slot: 'secondary' },
}

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

function numberOrUndefined(value) {
  if (value === undefined || value === null || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeWeaponId(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function round(value) {
  return Math.round(value)
}

function roundOne(value) {
  return Math.round(value * 10) / 10
}

function damageMap(cells) {
  return Object.fromEntries(
    RANGES.map((range, index) => [String(range), numberOrUndefined(cells[index])]).filter(([, value]) => value !== undefined),
  )
}

function shotsToKill(hp, damage) {
  if (!damage || damage <= 0) return undefined
  return Math.ceil(hp / damage)
}

function bulletTravelMs(velocity, range) {
  if (!velocity || velocity <= 0) return 0
  return (range / velocity) * 1000
}

function buildRangeModel(damageByRange, rpm, velocity, hp) {
  const stkByRange = {}
  const ttkByRange = {}
  const clickTtkByRange = {}

  for (const range of RANGES) {
    const key = String(range)
    const damage = damageByRange[key]
    const stk = shotsToKill(hp, damage)
    if (!stk || !rpm) continue

    const ttk = (stk - 1) * (60000 / rpm)
    stkByRange[key] = stk
    ttkByRange[key] = round(ttk)
    clickTtkByRange[key] = round(ttk + bulletTravelMs(velocity, range))
  }

  return { stkByRange, ttkByRange, clickTtkByRange }
}

function bestAvailable(map, preferredRanges) {
  for (const range of preferredRanges) {
    const value = map[String(range)]
    if (value !== undefined) return value
  }
  return undefined
}

function readWeaponRows(rows) {
  const weapons = []
  let section
  let current

  for (const row of rows) {
    if (row[1] === 'HIPFIRE') {
      section = row[0]
      current = undefined
      continue
    }

    if (!section || !categoryMap[section] || row.filter(Boolean).length < 5) continue

    if (row[0]) {
      current = {
        sourceName: row[0],
        category: section,
        multipliers: [],
        hipfire: numberOrUndefined(row[1]),
        precision: numberOrUndefined(row[2]),
        control: numberOrUndefined(row[3]),
        mobility: numberOrUndefined(row[4]),
        adsMs: numberOrUndefined(row[5]),
        reloadSeconds: numberOrUndefined(row[6]),
        velocity: numberOrUndefined(row[7]),
        magSize: numberOrUndefined(row[8]),
        rpm: numberOrUndefined(row[9]),
      }
      weapons.push(current)
    }

    if (!current || !row[10]) continue
    current.multipliers.push({
      multiplier: numberOrUndefined(row[10]),
      dps: numberOrUndefined(row[11]),
      damageByRange: damageMap(row.slice(12, 19)),
    })
  }

  return weapons
}

function deriveWeapon(raw) {
  const category = categoryMap[raw.category]
  const body = raw.multipliers.find((entry) => entry.multiplier === 1) ?? raw.multipliers.at(-1)
  const head = [...raw.multipliers]
    .filter((entry) => entry.multiplier && entry.multiplier > 1)
    .sort((a, b) => (b.multiplier ?? 0) - (a.multiplier ?? 0))[0]
  const bodyDamageByRange = body?.damageByRange ?? {}
  const standard = buildRangeModel(bodyDamageByRange, raw.rpm, raw.velocity, STANDARD_HP)
  const redsec = buildRangeModel(bodyDamageByRange, raw.rpm, raw.velocity, REDSEC_EHP_PROXY)
  const damage20 = bestAvailable(bodyDamageByRange, [20, 10, 0, 35])
  const closeDps = damage20 && raw.rpm ? roundOne((damage20 * raw.rpm) / 60) : undefined

  return {
    id: normalizeWeaponId(raw.sourceName),
    name: raw.sourceName,
    category: raw.category,
    categoryKey: category.key,
    className: category.className,
    slot: category.slot,
    hipfire: raw.hipfire,
    precision: raw.precision,
    control: raw.control,
    mobility: raw.mobility,
    adsMs: raw.adsMs,
    reloadSeconds: raw.reloadSeconds,
    velocity: raw.velocity,
    magSize: raw.magSize,
    rpm: raw.rpm,
    closeBodyDps: closeDps,
    bodyDamageByRange,
    headDamageByRange: head?.damageByRange ?? {},
    stk100ByRange: standard.stkByRange,
    ttk100ByRange: standard.ttkByRange,
    clickTtk100ByRange: standard.clickTtkByRange,
    stk180ByRange: redsec.stkByRange,
    ttk180ByRange: redsec.ttkByRange,
    clickTtk180ByRange: redsec.clickTtkByRange,
  }
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2)
}

async function main() {
  const response = await fetch(SOURCE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch weapon sheet: ${response.status} ${response.statusText}`)
  }

  const csv = await response.text()
  const rows = parseCsv(csv)
  const rawWeapons = readWeaponRows(rows)
  const weapons = rawWeapons.map(deriveWeapon)
  const sourceHash = createHash('sha256').update(csv).digest('hex').slice(0, 16)

  const dataset = {
    schemaVersion: 1,
    source: {
      label: 'Public BF6 weapon data',
      sheetId: SHEET_ID,
      gid: SHEET_GID,
      sourceHash,
      rowCount: rows.length,
    },
    model: {
      ranges: RANGES,
      standardHp: STANDARD_HP,
      redsecEhpProxy: REDSEC_EHP_PROXY,
    },
    weapons,
  }

  const file = `// Generated by scripts/ingestWeapons.mjs. Do not edit by hand.\nexport const generatedWeaponStats = ${stableStringify(dataset)} as const\n`

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, file, 'utf8')
  console.log(`Generated ${weapons.length} weapons from ${rows.length} rows (${sourceHash}).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
