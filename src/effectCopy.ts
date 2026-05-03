import type { Lang } from './data'

export const effectUiCopy: Record<string, { it: string; en: string }> = {
  accuracyOverTime: { it: 'Precisione su raffica lunga', en: 'Sustained accuracy' },
  adsMovementSpeed: { it: 'Velocita in ADS', en: 'ADS movement speed' },
  adsMovingAccuracy: { it: 'Precisione in movimento ADS', en: 'Moving ADS accuracy' },
  adsTimeTier: { it: 'Tempo ADS', en: 'ADS speed' },
  drawSpeed: { it: 'Velocita di estrazione', en: 'Draw speed' },
  hidingVisibility: { it: 'Visibilita ridotta', en: 'Reduced visibility' },
  hipfire: { it: 'Hipfire', en: 'Hipfire' },
  projectileVelocity: { it: 'Velocita proiettile', en: 'Projectile velocity' },
  recoilControl: { it: 'Controllo rinculo', en: 'Recoil control' },
  recoilPrecision: { it: 'Precisione rinculo', en: 'Recoil precision' },
  recoilRecovery: { it: 'Recupero rinculo', en: 'Recoil recovery' },
  weaponSway: { it: 'Stabilita mira', en: 'Weapon sway control' },
}

export function effectLabel(key: string, lang: Lang) {
  return effectUiCopy[key]?.[lang] ?? key
}
