import type { Lang } from './data'

export type ArchetypeUiCopy = {
  label: { it: string; en: string }
  tagline: { it: string; en: string }
}

export const archetypeUiCopy: Record<string, ArchetypeUiCopy> = {
  'mid-control': {
    label: { it: 'Controllo medio', en: 'Mid control' },
    tagline: {
      it: 'AR di controllo a distanze medie con focus su precisione sostenuta.',
      en: 'Control AR at medium range with sustained accuracy focus.',
    },
  },
  'close-redsec': {
    label: { it: 'REDSEC ravvicinato', en: 'REDSEC close' },
    tagline: {
      it: 'SMG per CQC e clear di edifici REDSEC, handling-first.',
      en: 'SMG for CQC and REDSEC building clear, handling-first.',
    },
  },
  'anchor-sustain': {
    label: { it: 'Sostegno fisso', en: 'Anchor support' },
    tagline: {
      it: 'LMG da DPS sostenuto su lane controllate e angoli preparati.',
      en: 'LMG for sustained DPS on controlled lanes and prepared angles.',
    },
  },
  'info-range': {
    label: { it: 'Lunga distanza', en: 'Long range' },
    tagline: {
      it: 'DMR per conversione armor crack e info-pick a media-lunga distanza.',
      en: 'DMR for armor crack conversion and info-picks at mid-long range.',
    },
  },
  'mobile-pick': {
    label: { it: 'Pick mobile', en: 'Mobile pick' },
    tagline: {
      it: 'Sniper handling-first per gioco mobile, draw rapido e riposizionamento.',
      en: 'Handling-first sniper for mobile play, fast draw and reposition.',
    },
  },
  'mobile-flex': {
    label: { it: 'Flex mobile', en: 'Mobile flex' },
    tagline: {
      it: 'Carbine versatile per movimento, push e adattamento ai range.',
      en: 'Versatile carbine for movement, pushing, and range adaptation.',
    },
  },
  'building-clear': {
    label: { it: 'Pulizia edifici', en: 'Building clear' },
    tagline: {
      it: 'Shotgun per CQC indoor, one-shot pressure su corner e stairwell.',
      en: 'Shotgun for indoor CQC, one-shot pressure on corners and stairwells.',
    },
  },
  'emergency-backup': {
    label: { it: 'Backup di emergenza', en: 'Emergency backup' },
    tagline: {
      it: 'Sidearm di riserva con resa rapida quando il primario e scarico.',
      en: 'Backup sidearm with quick output when primary is empty.',
    },
  },
  balanced: {
    label: { it: 'Equilibrato', en: 'Balanced' },
    tagline: {
      it: 'Setup bilanciato senza specializzazione marcata.',
      en: 'Balanced setup without strong specialization.',
    },
  },
}

export function archetypeLabel(id: string, lang: Lang) {
  return archetypeUiCopy[id]?.label[lang] ?? id
}

export function archetypeTagline(id: string, lang: Lang) {
  return archetypeUiCopy[id]?.tagline[lang] ?? ''
}
