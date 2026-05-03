// Layer A = BF6Bible numeric solver authority.
// Layer B = literal battlefieldmeta.gg consensus authority for slots without trusted numeric effects.
export const layerASlots = ['muzzle', 'barrel', 'underbarrel'] as const

export const layerBSlots = [
  'laser',
  'optic',
  'magazine',
  'ammo',
  'opticAccessory',
  'leftAccessory',
  'rightAccessory',
  'topAccessory',
  'ergonomics',
] as const

export const consensusSlotMapping: Record<string, string> = {
  Muzzle: 'muzzle',
  Barrel: 'barrel',
  Underbarrel: 'underbarrel',
  Magazine: 'magazine',
  Ammunition: 'ammo',
  Scope: 'optic',
  'Optic Accessory': 'opticAccessory',
  'Left Accessory': 'leftAccessory',
  'Right Accessory': 'rightAccessory',
  'Top Accessory': 'topAccessory',
  Ergonomics: 'ergonomics',
}

export function isLayerASlot(slot: string): boolean {
  return (layerASlots as readonly string[]).includes(slot)
}

export function isLayerBSlot(slot: string): boolean {
  return (layerBSlots as readonly string[]).includes(slot)
}
