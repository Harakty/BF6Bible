import { generatedWeaponStats } from './generated/weaponStats'

export { generatedWeaponStats }

export type GeneratedWeaponStat = (typeof generatedWeaponStats.weapons)[number]
export type RangeNumberMap = Partial<Record<string, number>>

const weaponAliases = new Map<string, string>([
  ['MINIFIX', 'MINISCOUT'],
  ['MINISCOUT', 'MINISCOUT'],
  ['SOR300C', 'SOR300SC'],
  ['SOR300SC', 'SOR300SC'],
])

export function normalizeWeaponName(name: string) {
  const normalized = name.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return weaponAliases.get(normalized) ?? normalized
}

const generatedByName = new Map(generatedWeaponStats.weapons.map((weapon) => [normalizeWeaponName(weapon.name), weapon]))

export function generatedStatForName(name: string) {
  return generatedByName.get(normalizeWeaponName(name))
}

export function rangeValue(map: RangeNumberMap, preferredRanges: number[]) {
  for (const range of preferredRanges) {
    const value = map[String(range)]
    if (value !== undefined) return value
  }
  return undefined
}
