// Sprint 3 bootstrap: data extracted manually from BF6 Bible research.md
// (curated 2026-05-02). Sprint 4 will replace with automated ingest
// from BattlefieldMeta/Sym.gg adapters.

export type ConsensusConfidence = 'high' | 'medium' | 'low' | 'absent'

export type ConsensusEntry = {
  weaponName: string
  consensusTier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | null
  consensusRole?: string
  suggestedBuild?: {
    attachments: string[]
    totalPoints: number
    note?: string
  }
  spendTarget?: 'high' | 'medium' | 'low'
  confidence: ConsensusConfidence
  sources: string[]
}

export const externalMetaConsensus: ConsensusEntry[] = [
  {
    weaponName: 'KORD 6P67',
    consensusTier: 'S',
    consensusRole: 'Long-range AR',
    suggestedBuild: {
      attachments: ['415MM Prototype', '6H64 Vertical', 'Polymer Case', 'Lightened Suppressor', '36 RND', 'Baker 3.00x'],
      totalPoints: 90,
      note: 'Verified research build; several attachment names are outside the current attachmentData slot model.',
    },
    spendTarget: 'high',
    confidence: 'high',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L29', 'BF6 Bible research.md L44'],
  },
  {
    weaponName: 'KTS100 MK8',
    consensusTier: 'S',
    consensusRole: 'LMG long-range control',
    suggestedBuild: {
      attachments: ['508MM MK8', 'Slim Angled', 'Polymer Case', 'Lightened Suppressor', 'Rail Cover', '60RND Magazine', 'BF-2M 2.50x'],
      totalPoints: 90,
      note: 'Verified research build; several attachment names are outside the current attachmentData slot model.',
    },
    spendTarget: 'high',
    confidence: 'high',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L33', 'BF6 Bible research.md L45'],
  },
  {
    weaponName: 'DRS-IAR',
    consensusTier: 'S',
    consensusRole: 'LMG flex/lane control',
    suggestedBuild: {
      attachments: ['20" SDM-R', '6H64 Vertical', 'Polymer Case', 'Lightened Suppressor', '36 RND', 'Baker 3.00x'],
      totalPoints: 88,
      note: 'Verified research build; several attachment names are outside the current attachmentData slot model.',
    },
    spendTarget: 'high',
    confidence: 'high',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L34', 'BF6 Bible research.md L45'],
  },
  {
    weaponName: 'M2010 ESR',
    consensusTier: 'S+',
    consensusRole: 'Recon/Pick',
    suggestedBuild: {
      attachments: ['26" Carbon', 'Slim Angled', 'Match Grade', 'Standard Suppressor', 'Range Finder', 'Anti-Glare Coating', '5RND Magazine', 'LERT 8.00x'],
      totalPoints: 90,
      note: 'Verified research build; several attachment names are outside the current attachmentData slot model.',
    },
    spendTarget: 'high',
    confidence: 'high',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L37', 'BF6 Bible research.md L48'],
  },
  {
    weaponName: 'VCR-2',
    consensusTier: 'S',
    consensusRole: 'AR close-range CQC',
    spendTarget: 'high',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L30', 'BF6 Bible research.md L46'],
  },
  {
    weaponName: 'AK-205',
    consensusTier: 'A',
    consensusRole: 'Carbine long-range',
    spendTarget: 'medium',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L31'],
  },
  {
    weaponName: 'M4A1',
    consensusTier: 'A',
    consensusRole: 'Carbine entry/aggressive',
    spendTarget: 'medium',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L32', 'BF6 Bible research.md L46'],
  },
  {
    weaponName: 'L110',
    consensusTier: 'A',
    consensusRole: 'LMG balanced',
    spendTarget: 'medium',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L35'],
  },
  {
    weaponName: 'M39 EMR',
    consensusTier: 'A',
    consensusRole: 'DMR mid-long',
    spendTarget: 'medium',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L36'],
  },
  {
    weaponName: 'M87A1',
    consensusTier: 'S',
    consensusRole: 'Shotgun CQC',
    spendTarget: 'high',
    confidence: 'medium',
    sources: ['BattlefieldMeta', 'BF6 Bible research.md L38'],
  },
  { weaponName: 'M433', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'B36A4', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SOR-556 MK2', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'AK4D', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'TR-7', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'NVO-228E', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'L85A3', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M277', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M417 A2', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'GRT-BC', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'QBZ-192', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SG 553R', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SOR-300SC', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SGX', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'PW5A3', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'PW7A2', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'UMG-40', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'USG-90', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'KV9', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SCW-10', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SL9', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'CZ3A1', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M/60', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'RPKM', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M123K', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M250', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M240L', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M121 A2', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'LMR27', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SVK-8.6', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SVDM', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'GRT-CPS', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'SV-98', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'PSR', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'MINI SCOUT', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M1014', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: '18.5KS-K', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'DB-12', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'P18', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'ES 5.7', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M45A1', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M44', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'GGH-22', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'M357 TRAIT', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
  { weaponName: 'VZ. 61', consensusTier: null, confidence: 'absent', sources: ['BF6 Bible research.md'] },
] as const satisfies ConsensusEntry[]
