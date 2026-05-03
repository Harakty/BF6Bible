import type { Lang } from './data'
import { normalizeWeaponName } from './weaponStats'

export type WeaponRationale = {
  it: string
  en: string
  placeholder?: boolean
}

export const weaponBuildRationale: Record<string, WeaponRationale> = {
  'KORD 6P67': {
    it: 'AR control long-range, TTK 293ms e roleFit Assault 96. Consensus high.',
    en: 'Long-range control AR, 293ms TTK and 96 Assault roleFit. High consensus.',
  },
  'M2010 ESR': {
    it: 'Top sniper Recon nel consensus pubblico. In Recon e tier A con roleFit 98. Consensus high.',
    en: 'Top Recon sniper in public consensus. In Recon it is A tier with 98 roleFit. High consensus.',
  },
  'DRS-IAR': {
    it: 'LMG flex per lane control: TTK 261ms, Support roleFit 97. Consensus high.',
    en: 'Flex LMG for lane control: 261ms TTK, 97 Support roleFit. High consensus.',
  },
  'AK-205': {
    it: 'Carbine long-range: rank A in Geniere, roleFit 95 e TTK 444ms. Consensus medium.',
    en: 'Long-range carbine: A rank in Engineer, 95 roleFit and 444ms TTK. Medium consensus.',
  },
  'SG-553R': {
    it: 'Carbine stabile per Geniere: rank A, roleFit 95 e TTK 289ms.',
    en: 'Stable Engineer carbine: A rank, 95 roleFit and 289ms TTK.',
    placeholder: true,
  },
  'VCR-2': {
    it: 'AR CQC con TTK 236ms e tier S in All/Assault. Consensus medium.',
    en: 'CQC AR with 236ms TTK and S tier in All/Assault. Medium consensus.',
  },
  L110: {
    it: 'LMG bilanciata: tier A in Support, roleFit 97 e TTK 276ms. Consensus medium.',
    en: 'Balanced LMG: A tier in Support, 97 roleFit and 276ms TTK. Medium consensus.',
  },
  'SCW-10': {
    it: 'SMG close per Geniere: tier S, roleFit 90 e TTK 272ms.',
    en: 'Close Engineer SMG: S tier, 90 roleFit and 272ms TTK.',
  },
  KV9: {
    it: 'SMG top nei ranking Geniere: tier S, score 85 e TTK 280ms.',
    en: 'Top Engineer SMG in our ranking: S tier, 85 score and 280ms TTK.',
  },
  'M39 EMR': {
    it: 'DMR Recon: tier A in Recon, roleFit 100 e TTK 492ms. Consensus medium.',
    en: 'Recon DMR: A tier in Recon, 100 roleFit and 492ms TTK. Medium consensus.',
  },
  M4A1: {
    it: 'Carbine entry: tier A in Geniere, roleFit 95 e TTK 306ms. Consensus medium.',
    en: 'Entry carbine: A tier in Engineer, 95 roleFit and 306ms TTK. Medium consensus.',
  },
  M45A1: {
    it: 'Sidearm backup: TTK 610ms e roleFit basso. Usala per cleanup, non come seconda REDSEC.',
    en: 'Backup sidearm: 610ms TTK and low roleFit. Use for cleanup, not as a REDSEC second weapon.',
    placeholder: true,
  },
  'KTS100 MK8': {
    it: 'LMG lane lunghe. Consensus high; sotto-spende per preservare diversity LMG.',
    en: 'Long-lane LMG. High consensus; it under-spends to preserve LMG diversity.',
  },
  M433: {
    it: 'AR molto solido: tier A in All, tier S in Assault e TTK 247ms.',
    en: 'Very solid AR: A tier in All, S tier in Assault and 247ms TTK.',
  },
  'SOR-556 Mk2': {
    it: 'AR di controllo: tier A in Assault, roleFit 96 e TTK 342ms.',
    en: 'Control AR: A tier in Assault, 96 roleFit and 342ms TTK.',
    placeholder: true,
  },
  M250: {
    it: 'LMG Support: tier A, roleFit 97 e TTK 293ms.',
    en: 'Support LMG: A tier, 97 roleFit and 293ms TTK.',
    placeholder: true,
  },
  M44: {
    it: 'Revolver backup: TTK 414ms ma REDSEC TTK 1920ms. Solo emergenza.',
    en: 'Backup revolver: 414ms TTK but 1920ms REDSEC TTK. Emergency only.',
    placeholder: true,
  },
  'TR-7': {
    it: 'AR aggressiva: tier S in Assault, roleFit 96 e TTK 198ms.',
    en: 'Aggressive AR: S tier in Assault, 96 roleFit and 198ms TTK.',
  },
  'QBZ-192': {
    it: 'Carbine Geniere: tier A, roleFit 95 e TTK 342ms.',
    en: 'Engineer carbine: A tier, 95 roleFit and 342ms TTK.',
    placeholder: true,
  },
  M123K: {
    it: 'LMG sustain: tier A in All/Support, TTK 254ms e roleFit Support 97.',
    en: 'Sustain LMG: A tier in All/Support, 254ms TTK and 97 Support roleFit.',
    placeholder: true,
  },
  L85A3: {
    it: 'AR controllabile: tier A in Assault, roleFit 96 e TTK 308ms.',
    en: 'Controllable AR: A tier in Assault, 96 roleFit and 308ms TTK.',
    placeholder: true,
  },
  SVDM: {
    it: 'DMR Recon: tier A, roleFit 100 e TTK 431ms.',
    en: 'Recon DMR: A tier, 100 roleFit and 431ms TTK.',
    placeholder: true,
  },
  'MINI SCOUT': {
    it: 'Sniper mobile: tier A in Recon, roleFit 98 e TTK 1201ms.',
    en: 'Mobile sniper: A tier in Recon, 98 roleFit and 1201ms TTK.',
    placeholder: true,
  },
  'ES 5.7': {
    it: 'Sidearm backup rapida: TTK 697ms, utile solo per finire target rotti.',
    en: 'Fast backup sidearm: 697ms TTK, useful only to finish broken targets.',
    placeholder: true,
  },
  'SOR-300C': {
    it: 'Carbine mobile: tier A in Geniere, roleFit 95 e TTK 336ms.',
    en: 'Mobile carbine: A tier in Engineer, 95 roleFit and 336ms TTK.',
    placeholder: true,
  },
  RPKM: {
    it: 'LMG Support: tier A, roleFit 97 e TTK 349ms.',
    en: 'Support LMG: A tier, 97 roleFit and 349ms TTK.',
    placeholder: true,
  },
  SGX: {
    it: 'SMG Geniere: tier S, roleFit 90 e TTK 339ms.',
    en: 'Engineer SMG: S tier, 90 roleFit and 339ms TTK.',
    placeholder: true,
  },
  PW5A3: {
    it: 'SMG close: tier A in Geniere, roleFit 90 e TTK 358ms.',
    en: 'Close SMG: A tier in Engineer, 90 roleFit and 358ms TTK.',
    placeholder: true,
  },
  'SVK-8.6': {
    it: 'DMR Recon: roleFit 100 e TTK 422ms, ma tier B per controllo/armor value.',
    en: 'Recon DMR: 100 roleFit and 422ms TTK, but B tier due control/armor value.',
    placeholder: true,
  },
  PW7A2: {
    it: 'SMG da Geniere: tier S nello scenario, roleFit 90 e TTK 350ms.',
    en: 'Engineer SMG: S tier in scenario, 90 roleFit and 350ms TTK.',
    placeholder: true,
  },
  B36A4: {
    it: 'AR affidabile: tier A in All/Assault, roleFit 96 e TTK 276ms.',
    en: 'Reliable AR: A tier in All/Assault, 96 roleFit and 276ms TTK.',
    placeholder: true,
  },
  'NVO-228E': {
    it: 'AR di controllo: tier A in Assault, roleFit 96 e TTK 305ms.',
    en: 'Control AR: A tier in Assault, 96 roleFit and 305ms TTK.',
    placeholder: true,
  },
  M277: {
    it: 'Carbine forte in Geniere: tier S, roleFit 95 e TTK 282ms.',
    en: 'Strong Engineer carbine: S tier, 95 roleFit and 282ms TTK.',
    placeholder: true,
  },
  'GRT-BC': {
    it: 'Carbine Geniere: tier A, roleFit 95 e TTK 323ms.',
    en: 'Engineer carbine: A tier, 95 roleFit and 323ms TTK.',
    placeholder: true,
  },
  'M/60': {
    it: 'LMG pesante: tier A in Support, roleFit 97 e TTK 261ms.',
    en: 'Heavy LMG: A tier in Support, 97 roleFit and 261ms TTK.',
    placeholder: true,
  },
  'LMR 27': {
    it: 'Top Recon DMR: tier S, rank 1/55 in Recon, roleFit 100 e TTK 423ms.',
    en: 'Top Recon DMR: S tier, rank 1/55 in Recon, 100 roleFit and 423ms TTK.',
  },
  AK4D: {
    it: 'AR Assault: tier A, roleFit 96 e TTK 261ms.',
    en: 'Assault AR: A tier, 96 roleFit and 261ms TTK.',
    placeholder: true,
  },
  'M417 A2': {
    it: 'Carbine Geniere: tier A, roleFit 95 e TTK 309ms.',
    en: 'Engineer carbine: A tier, 95 roleFit and 309ms TTK.',
    placeholder: true,
  },
  'USG-90': {
    it: 'SMG Geniere: tier A, roleFit 90 e TTK 368ms.',
    en: 'Engineer SMG: A tier, 90 roleFit and 368ms TTK.',
    placeholder: true,
  },
  M240L: {
    it: 'LMG con TTK 232ms, tier A in All/Support e roleFit Support 97.',
    en: 'LMG with 232ms TTK, A tier in All/Support and 97 Support roleFit.',
    placeholder: true,
  },
  PSR: {
    it: 'Sniper Recon: tier A, roleFit 98 e TTK 1607ms.',
    en: 'Recon sniper: A tier, 98 roleFit and 1607ms TTK.',
    placeholder: true,
  },
  'UMG-40': {
    it: 'SMG piu lenta: tier A in Geniere, roleFit 90 e TTK 419ms.',
    en: 'Slower SMG: A tier in Engineer, 90 roleFit and 419ms TTK.',
    placeholder: true,
  },
  CZ3A1: {
    it: 'SMG aggressiva: tier S in Geniere, roleFit 90 e TTK 300ms.',
    en: 'Aggressive SMG: S tier in Engineer, 90 roleFit and 300ms TTK.',
    placeholder: true,
  },
  SL9: {
    it: 'SMG Geniere: tier A, roleFit 90 e TTK 395ms.',
    en: 'Engineer SMG: A tier, 90 roleFit and 395ms TTK.',
    placeholder: true,
  },
  'SV-98': {
    it: 'Sniper Recon: tier S, roleFit 98 e TTK 1607ms.',
    en: 'Recon sniper: S tier, 98 roleFit and 1607ms TTK.',
    placeholder: true,
  },
  M1014: {
    it: 'Shotgun CQC: roleFit Geniere 78, ma tier D fuori indoor.',
    en: 'CQC shotgun: 78 Engineer roleFit, but D tier outside indoor fights.',
    placeholder: true,
  },
  'M121 A2': {
    it: 'LMG stabile: tier A in All, roleFit 84 e TTK 225ms.',
    en: 'Stable LMG: A tier in All, 84 roleFit and 225ms TTK.',
    placeholder: true,
  },
  'GRT-CPS': {
    it: 'DMR Recon: tier A, roleFit 100 e TTK 520ms.',
    en: 'Recon DMR: A tier, 100 roleFit and 520ms TTK.',
    placeholder: true,
  },
  'DB-12': {
    it: 'Shotgun indoor: roleFit Geniere 78, ma REDSEC TTK 2888ms fuori range.',
    en: 'Indoor shotgun: 78 Engineer roleFit, but 2888ms REDSEC TTK outside range.',
    placeholder: true,
  },
  'M357 TRAIT': {
    it: 'Revolver backup: TTK 582ms e roleFit basso. Solo emergenza.',
    en: 'Backup revolver: 582ms TTK and low roleFit. Emergency only.',
    placeholder: true,
  },
  'VZ. 61': {
    it: 'Sidearm backup: tier C in All, TTK 501ms e build da 30 punti.',
    en: 'Backup sidearm: C tier in All, 501ms TTK and 30-point build.',
    placeholder: true,
  },
  'GGH-22': {
    it: 'Sidearm backup: TTK 717ms e roleFit basso. Usala solo a primario scarico.',
    en: 'Backup sidearm: 717ms TTK and low roleFit. Use only when primary is empty.',
    placeholder: true,
  },
  P18: {
    it: 'Sidearm backup: TTK 657ms, utile per cleanup ravvicinato.',
    en: 'Backup sidearm: 657ms TTK, useful for close cleanup.',
    placeholder: true,
  },
  M87A1: {
    it: 'Shotgun CQC. Consensus medium, ma il ranking globale resta D per range limitato.',
    en: 'CQC shotgun. Medium consensus, but global ranking stays D because range is limited.',
  },
  '18.5KS-K': {
    it: 'Shotgun indoor: miglior scenario Geniere C, roleFit 78 e TTK 450ms.',
    en: 'Indoor shotgun: best Engineer scenario C, 78 roleFit and 450ms TTK.',
    placeholder: true,
  },
}

const normalizedRationale = new Map(Object.entries(weaponBuildRationale).map(([name, entry]) => [normalizeWeaponName(name), entry]))

export function weaponRationale(weaponName: string, lang: Lang) {
  const entry = weaponBuildRationale[weaponName] ?? normalizedRationale.get(normalizeWeaponName(weaponName))
  if (!entry) return { text: '', isPlaceholder: true }
  return { text: entry[lang], isPlaceholder: entry.placeholder ?? false }
}
