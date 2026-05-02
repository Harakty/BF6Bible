export type Lang = 'it' | 'en'
export type ModeId = 'quads' | 'duos'
export type SourceKind = 'official' | 'sym' | 'community-sheet' | 'comparator' | 'analysis'

export type Localized = {
  it: string
  en: string
}

export type Source = {
  id: string
  label: string
  url: string
  kind: SourceKind
  weight: number
  note: Localized
}

export type LocalizedTerm = {
  name: Localized
  alias?: Localized
}

export type WeaponMetric = {
  weapon: LocalizedTerm
  className: Localized
  baselineTtkMs?: number
  baselineStk?: number
  redsecUse: Localized
  strength: Localized
  risk: Localized
  sourceIds: string[]
  confidence: number
}

export type Build = {
  primary: WeaponMetric
  alternative?: WeaponMetric
  attachments: LocalizedTerm[]
  gadgets: LocalizedTerm[]
  fieldSpec: LocalizedTerm
  playbook: Localized[]
  engagement: Localized
}

export type SquadRole = {
  id: string
  callSign: Localized
  className: Localized
  mission: Localized
  build: Build
  swapRule?: Localized
}

export type ModePlan = {
  id: ModeId
  title: Localized
  subtitle: Localized
  squadLogic: Localized
  pressureRules: Localized[]
  roles: SquadRole[]
  sourceIds: string[]
  season3Note: Localized
}

export const sources: Source[] = [
  {
    id: 'ea-redsec-armor',
    label: 'EA REDSEC Armor Deep Dive',
    url: 'https://www.ea.com/games/battlefield/redsec/news/redsec-community-update-armor',
    kind: 'official',
    weight: 1,
    note: {
      it: 'Modello ufficiale armor: BR 80 HP, danno contro armor separato e drop-off esteso.',
      en: 'Official armor model: BR has 80 armor HP, separate armor damage, extended fall-off.',
    },
  },
  {
    id: 'ea-season3',
    label: 'EA Season 3 REDSEC / Ranked BR',
    url: 'https://www.ea.com/games/battlefield/battlefield-6/news/battlefield-6-community-update-railway-to-golmud-ranked-br-and-more',
    kind: 'official',
    weight: 1,
    note: {
      it: 'Ranked Battle Royale Quads arriva con Season 3 il 12 maggio 2026; Solo torna più avanti nella stagione.',
      en: 'Ranked Battle Royale Quads arrives with Season 3 on May 12, 2026; Solos returns later in the season.',
    },
  },
  {
    id: 'ea-classes',
    label: 'EA Class Guide',
    url: 'https://help.ea.com/en/articles/battlefield/battlefield-6/class-guide/',
    kind: 'official',
    weight: 0.95,
    note: {
      it: 'Ruoli ufficiali, gadget firma, armi firma e Field Specs.',
      en: 'Official roles, signature gadgets, signature weapons, and Field Specs.',
    },
  },
  {
    id: 'sym-bf6',
    label: 'Sym.gg BF6 Charts',
    url: 'https://sym.gg/legacy/index.html?game=bf6&page=charts',
    kind: 'sym',
    weight: 0.9,
    note: {
      it: 'Fonte tecnica per recoil, spread, damage, ROF e comparazioni hard-stat.',
      en: 'Technical source for recoil, spread, damage, ROF, and hard-stat comparisons.',
    },
  },
  {
    id: 'sheetonmyface',
    label: 'BF6 Interactive Weapon Data v1.50',
    url: 'https://docs.google.com/spreadsheets/d/118MpX9TrSRp_HW7xILEDuDSZC6_GewBGFh1Xa4H6XPg/edit?usp=sharing',
    kind: 'community-sheet',
    weight: 0.82,
    note: {
      it: 'Spreadsheet interattivo con TTK, falloff, headshot, ammo, recoil, ADS e proficiencies.',
      en: 'Interactive spreadsheet with TTK, fall-off, headshots, ammo, recoil, ADS, and proficiencies.',
    },
  },
  {
    id: 'battlefieldmeta',
    label: 'BattlefieldMeta Weapon Comparator',
    url: 'https://battlefieldmeta.gg/weapon-comparator',
    kind: 'comparator',
    weight: 0.65,
    note: {
      it: 'Comparator pubblico aggiornato al 1 maggio 2026; utile ma da validare contro Sym/sheet.',
      en: 'Public comparator updated May 1, 2026; useful but should be validated against Sym/sheets.',
    },
  },
]

const attachment = (it: string, en: string): LocalizedTerm => ({ name: { it, en } })

const weapon = (
  name: string,
  classIt: string,
  classEn: string,
  baselineTtkMs: number | undefined,
  baselineStk: number | undefined,
  redsecUseIt: string,
  redsecUseEn: string,
  strengthIt: string,
  strengthEn: string,
  riskIt: string,
  riskEn: string,
  sourceIds: string[],
  confidence: number,
): WeaponMetric => ({
  weapon: { name: { it: name, en: name } },
  className: { it: classIt, en: classEn },
  baselineTtkMs,
  baselineStk,
  redsecUse: { it: redsecUseIt, en: redsecUseEn },
  strength: { it: strengthIt, en: strengthEn },
  risk: { it: riskIt, en: riskEn },
  sourceIds,
  confidence,
})

export const weapons = {
  kord: weapon(
    'KORD 6P67',
    "Fucile d'assalto",
    'Assault Rifle',
    300,
    4,
    'Ancora flessibile per mid range e push controllati.',
    'Flexible anchor for mid-range fights and controlled pushes.',
    'ROF alto con recoil gestibile: scala bene con armor e teamfire.',
    'High ROF with manageable recoil: scales well into armor and teamfire.',
    'Richiede disciplina a lunga distanza; burst brevi oltre il mid range.',
    'Needs discipline at long range; use short bursts past mid range.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.82,
  ),
  ak205: weapon(
    'AK-205',
    'Carabina',
    'Carbine',
    333,
    5,
    'Flex weapon per Engineer o Recon che deve vincere duelli a 25-70 m.',
    'Flex weapon for Engineer or Recon winning 25-70 m duels.',
    'Buon controllo e performance pratica sopra il TTK teorico.',
    'Good control and practical performance beyond paper TTK.',
    'Più lenta in close quarters puro contro SMG/AR ad alto ROF.',
    'Slower in pure close quarters against high-ROF SMGs/ARs.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.78,
  ),
  drs: weapon(
    'DRS-IAR',
    'LMG',
    'LMG',
    300,
    4,
    'Support anchor per tenere lane, chiudere revive e reggere fight lunghi.',
    'Support anchor for lanes, revive cover, and long fights.',
    'Stabilità, volume di fuoco e ottimo valore in teamfight con armor.',
    'Stability, sustained fire, and strong teamfight value into armor.',
    'Se giochi entry aggressivo, ADS e mobilità puniscono gli errori.',
    'If played as an entry weapon, ADS and mobility punish mistakes.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.79,
  ),
  sg553: weapon(
    'SG-553R',
    'Carabina',
    'Carbine',
    300,
    4,
    'Seconda opzione flex per map flow veloce e rotazioni aggressive.',
    'Second flex option for fast map flow and aggressive rotations.',
    'TTK competitivo con profilo da carabina e buone rotazioni.',
    'Competitive TTK with carbine handling and strong rotations.',
    'Il valore cala se non controlli distanza e munizioni.',
    'Value drops if you fail to manage range and ammo.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.76,
  ),
  vcr2: weapon(
    'VCR-2',
    "Fucile d'assalto",
    'Assault Rifle',
    200,
    4,
    'Swap da close-range quando il piano è final circle in edifici.',
    'Close-range swap when the plan is building-heavy final circles.',
    'TTK teorico molto rapido e pressione alta da entry.',
    'Very fast theoretical TTK and high entry pressure.',
    'Fuori dal close range diventa una scelta più rischiosa del KORD.',
    'Past close range it is riskier than the KORD.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.72,
  ),
  scw: weapon(
    'SCW-10',
    'SMG',
    'SMG',
    300,
    4,
    'Opzione close per Engineer aggressivo in bunker, tunnel e finali stretti.',
    'Close option for aggressive Engineer in bunkers, tunnels, and tight endings.',
    'Molto forte quando ogni fight è sotto i 20 metri.',
    'Very strong when every fight happens under 20 meters.',
    'In REDSEC perde valore se devi rompere armor a range aperto.',
    'In REDSEC it loses value when breaking armor in open-range fights.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.74,
  ),
  l110: weapon(
    'L110',
    'LMG',
    'LMG',
    250,
    4,
    'Alternativa Support più rapida quando serve tenere pressione senza immobilizzarsi.',
    'Faster Support alternative when pressure matters without becoming static.',
    'TTK vicino molto forte con buona velocity.',
    'Strong close TTK with good velocity.',
    'Meno permissiva della DRS-IAR nei fight prolungati.',
    'Less forgiving than the DRS-IAR in extended fights.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.7,
  ),
  m39: weapon(
    'M39 EMR',
    'DMR',
    'DMR',
    467,
    3,
    'Pick Recon se la squadra gioca info, third-party e distanza.',
    'Recon pick when the squad plays information, third-party pressure, and range.',
    'Punisce armor rotte e force reposition a media-lunga distanza.',
    'Punishes broken armor and forces reposition at mid-long range.',
    'Meno valore se il duo/quads gioca hard-entry dentro strutture.',
    'Lower value if the squad plays hard-entry inside structures.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.68,
  ),
}

export const modePlans: Record<ModeId, ModePlan> = {
  quads: {
    id: 'quads',
    title: { it: 'REDSEC Quads', en: 'REDSEC Quads' },
    subtitle: {
      it: 'Composizione standard per ranked-ready squad: sustain, anti-vehicle, info, entry.',
      en: 'Ranked-ready squad template: sustain, anti-vehicle, information, entry.',
    },
    squadLogic: {
      it: 'Un solo entry, un solo anchor, un solo anti-vehicle e un solo info player. Non duplicare ruoli prima di coprire revive, armor, veicoli e ping.',
      en: 'One entry, one anchor, one anti-vehicle, and one information player. Do not duplicate roles before covering revive, armor, vehicles, and pings.',
    },
    season3Note: {
      it: 'Season 3 introduce Ranked Battle Royale Quads il 12 maggio 2026. Questa struttura è pronta per ranking, ma i valori delle armi vanno ricontrollati dopo le note complete.',
      en: 'Season 3 introduces Ranked Battle Royale Quads on May 12, 2026. This structure is ranked-ready, but weapon values need revalidation after full notes.',
    },
    sourceIds: ['ea-redsec-armor', 'ea-season3', 'ea-classes', 'sym-bf6', 'sheetonmyface'],
    pressureRules: [
      {
        it: 'Se il fight è aperto, non chaseare armor crack: Recon marca, Support tiene crossfire, Engineer controlla veicoli.',
        en: 'If the fight is open, do not chase armor cracks: Recon marks, Support holds crossfire, Engineer controls vehicles.',
      },
      {
        it: "Se il fight è sotto i 20 m, Assault chiama l'ingresso e Support smoke/defib tiene il reset.",
        en: 'If the fight is under 20 m, Assault calls the entry and Support smoke/defib holds the reset.',
      },
      {
        it: 'Un veicolo vicino cambia la priorità: Engineer non fa entry, gioca angoli e conserva utility.',
        en: 'A nearby vehicle changes priority: Engineer stops entrying, plays angles, and preserves utility.',
      },
    ],
    roles: [
      {
        id: 'assault-entry',
        callSign: { it: 'Entry / IGL', en: 'Entry / IGL' },
        className: { it: 'Assalto', en: 'Assault' },
        mission: {
          it: 'Aprire il fight, chiamare focus target e creare spawn pressure senza isolarsi.',
          en: 'Open fights, call focus targets, and create spawn pressure without isolating.',
        },
        swapRule: {
          it: 'Swap VCR-2 solo se il piano è push indoor o final circle stretto.',
          en: 'Swap to VCR-2 only for indoor pushes or tight final circles.',
        },
        build: {
          primary: weapons.kord,
          alternative: weapons.vcr2,
          fieldSpec: attachment('Frontliner / Prima linea', 'Frontliner'),
          attachments: [
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Canna Prototype 415 mm', '415mm Prototype Barrel'),
            attachment('Impugnatura verticale classica', 'Classic Vertical Grip'),
            attachment('Caricatore 36 colpi', '36rnd Magazine'),
            attachment('Ottica 3VZR 1,75x', '3VZR 1.75x'),
          ],
          gadgets: [
            attachment('Adrenaline Injector', 'Adrenaline Injector'),
            attachment('Deploy Beacon / Faro di schieramento', 'Deploy Beacon'),
            attachment('Granata flash o smoke', 'Flash or Smoke Grenade'),
          ],
          engagement: { it: '15-55 m, burst corti oltre 45 m', en: '15-55 m, short bursts past 45 m' },
          playbook: [
            {
              it: 'Non entri per primo se Support non ha linea revive o smoke pronta.',
              en: 'Do not enter first unless Support has revive line or smoke ready.',
            },
            {
              it: 'Armor crack va chiamato con direzione e distanza, non solo con il nome arma.',
              en: 'Call armor cracks with direction and range, not only the weapon name.',
            },
            {
              it: 'Se perdi trade iniziale, beacon e reset valgono più di una kill forzata.',
              en: 'If the opening trade fails, beacon and reset are worth more than a forced kill.',
            },
          ],
        },
      },
      {
        id: 'support-anchor',
        callSign: { it: 'Anchor / Medic', en: 'Anchor / Medic' },
        className: { it: 'Supporto', en: 'Support' },
        mission: {
          it: 'Tenere vivo il team, coprire revive e vincere fight lunghi contro armor.',
          en: 'Keep the team alive, cover revives, and win long armor fights.',
        },
        swapRule: {
          it: 'Swap L110 se vuoi meno peso e più pressione in rotazione.',
          en: 'Swap to L110 for lighter pressure while rotating.',
        },
        build: {
          primary: weapons.drs,
          alternative: weapons.l110,
          fieldSpec: attachment('Combat Medic / Medico da combattimento', 'Combat Medic'),
          attachments: [
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Canna fluted 16,5"', '16.5" Fluted Barrel'),
            attachment('Impugnatura 6H64 verticale', '6H64 Vertical Grip'),
            attachment('Caricatore 36 colpi', '36rnd Magazine'),
            attachment('Magwell flare', 'Magwell Flare'),
          ],
          gadgets: [
            attachment('Supply Bag / Borsa rifornimenti', 'Supply Bag'),
            attachment('Defibrillatore', 'Defibrillator'),
            attachment('Smoke launcher o granata smoke', 'Smoke Launcher or Smoke Grenade'),
          ],
          engagement: { it: '25-80 m, tieni crossfire e cover revive', en: '25-80 m, hold crossfire and revive cover' },
          playbook: [
            {
              it: 'Il tuo danno migliore è quello che impedisce al nemico di finire un down.',
              en: 'Your best damage is the damage that stops enemies from finishing a down.',
            },
            {
              it: 'Non sprecare smoke per push ciechi: prima chiudi linee sniper/DMR, poi revive.',
              en: 'Do not waste smoke for blind pushes: block sniper/DMR lines first, then revive.',
            },
            {
              it: 'Supply Bag e armor economy sono il motivo per cui il team resta nel match.',
              en: 'Supply Bag and armor economy are why the squad stays in the match.',
            },
          ],
        },
      },
      {
        id: 'engineer-av',
        callSign: { it: 'Anti-Vehicle', en: 'Anti-Vehicle' },
        className: { it: 'Geniere', en: 'Engineer' },
        mission: {
          it: 'Negare tank, trasporti e terze parti veicolari senza perdere il duello infantry.',
          en: 'Deny tanks, transports, and vehicle third parties without losing infantry duels.',
        },
        swapRule: {
          it: 'Swap SCW-10 solo in bunker/tunnel; fuori, tieni AK-205.',
          en: 'Swap to SCW-10 only in bunkers/tunnels; outside, keep AK-205.',
        },
        build: {
          primary: weapons.ak205,
          alternative: weapons.scw,
          fieldSpec: attachment('Anti-Armour / Anti-corazza', 'Anti-Armour'),
          attachments: [
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Munizioni Synthetic Tip', 'Synthetic Tip Ammunition'),
            attachment('Ottica 3VZR 1,75x', '3VZR 1.75x'),
            attachment('Caricatore 40 colpi', '40rnd Magazine'),
            attachment('Freno compensato', 'Compensated Brake'),
          ],
          gadgets: [
            attachment('Repair Tool / Strumento riparazione', 'Repair Tool'),
            attachment('Launcher anti-veicolo', 'Anti-Vehicle Launcher'),
            attachment('Mine anti-veicolo o utility smoke', 'Anti-Vehicle Mine or Smoke Utility'),
          ],
          engagement: { it: '25-70 m infantry, utility vs veicoli', en: '25-70 m infantry, utility against vehicles' },
          playbook: [
            {
              it: 'Non sparare il launcher per chip damage se il team non può followuppare.',
              en: 'Do not fire launcher chip damage unless the squad can follow up.',
            },
            {
              it: 'Quando un tank entra audio range, smetti di flankare e giochi counterplay.',
              en: 'When a tank enters audio range, stop flanking and play counterplay.',
            },
            {
              it: 'Se Support è down, la tua vita vale più del veicolo nemico.',
              en: 'If Support is down, your life is worth more than the enemy vehicle.',
            },
          ],
        },
      },
      {
        id: 'recon-info',
        callSign: { it: 'Info / Scout', en: 'Info / Scout' },
        className: { it: 'Ricognitore', en: 'Recon' },
        mission: {
          it: 'Dare informazioni, tagliare rotazioni e trasformare armor crack in wipe puliti.',
          en: 'Provide information, cut rotations, and turn armor cracks into clean wipes.',
        },
        swapRule: {
          it: 'Swap SG-553R se il cerchio obbliga a combattere in movimento.',
          en: 'Swap to SG-553R if the circle forces mobile fighting.',
        },
        build: {
          primary: weapons.m39,
          alternative: weapons.sg553,
          fieldSpec: attachment('Spec Ops / Forze speciali', 'Spec Ops'),
          attachments: [
            attachment('Ottica 3VZR 1,75x o 2,50x', '3VZR 1.75x or 2.50x Scope'),
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Munizioni precisione', 'Precision Ammunition'),
            attachment('Grip controllo rinculo', 'Recoil Control Grip'),
            attachment('Caricatore esteso se disponibile', 'Extended Magazine when available'),
          ],
          gadgets: [
            attachment('Motion Sensor / Sensore movimento', 'Motion Sensor'),
            attachment('Recon Drone', 'Recon Drone'),
            attachment('Tracer Dart o Demolition Charge', 'Tracer Dart or Demolition Charge'),
          ],
          engagement: { it: '35-110 m, info prima del danno', en: '35-110 m, information before damage' },
          playbook: [
            {
              it: 'Non fare il secondo sniper: sei la minimappa vivente del team.',
              en: 'Do not become a second sniper: you are the squad live minimap.',
            },
            {
              it: 'Ping e direzione contano più del danno quando il team sta ruotando.',
              en: 'Pings and direction matter more than damage while the squad rotates.',
            },
            {
              it: 'Il drone è più raro dopo Season 3 tuning: usalo per rotate e finali, non per curiosità.',
              en: 'Drone uptime is tighter after Season 3 tuning: use it for rotations and endings, not curiosity.',
            },
          ],
        },
      },
    ],
  },
  duos: {
    id: 'duos',
    title: { it: 'REDSEC Duos', en: 'REDSEC Duos' },
    subtitle: {
      it: 'Due ruoli soltanto: sustain obbligatorio e flex anti-pressure.',
      en: 'Only two roles: mandatory sustain and anti-pressure flex.',
    },
    squadLogic: {
      it: 'Il duo migliore non massimizza le kill: riduce i fight non recuperabili. Support è fisso; il secondo slot sceglie tra veicoli e info.',
      en: 'The best duo does not maximize kills: it reduces unrecoverable fights. Support is fixed; the second slot chooses between vehicles and information.',
    },
    season3Note: {
      it: 'Duos resta il banco prova migliore per validare eTTK, revive economy e armor discipline prima di ranked Quads.',
      en: 'Duos remains the best test bed for validating eTTK, revive economy, and armor discipline before ranked Quads.',
    },
    sourceIds: ['ea-redsec-armor', 'ea-classes', 'sym-bf6', 'sheetonmyface'],
    pressureRules: [
      {
        it: 'Se non avete Support, ogni trade perso diventa coin flip. Non è consigliato.',
        en: 'Without Support, every lost trade becomes a coin flip. Not recommended.',
      },
      {
        it: 'Engineer è la scelta default se la lobby usa mezzi; Recon è il default se la lobby è infantry-heavy.',
        en: 'Engineer is default when the lobby uses vehicles; Recon is default when it is infantry-heavy.',
      },
      {
        it: 'Il duo deve evitare 2v4 rumorosi: rompere armor, riposizionare, finire solo con crossfire.',
        en: 'The duo should avoid loud 2v4s: break armor, reposition, finish only with crossfire.',
      },
    ],
    roles: [
      {
        id: 'support-duo',
        callSign: { it: 'Medic Anchor', en: 'Medic Anchor' },
        className: { it: 'Supporto', en: 'Support' },
        mission: {
          it: 'Tenere il duo in vita e trasformare ogni down in reset, non in panico.',
          en: 'Keep the duo alive and turn every down into a reset, not panic.',
        },
        swapRule: {
          it: 'Swap L110 se giochi molto mobile e non tieni lane lunghe.',
          en: 'Swap to L110 if you play mobile and do not hold long lanes.',
        },
        build: {
          primary: weapons.drs,
          alternative: weapons.l110,
          fieldSpec: attachment('Combat Medic / Medico da combattimento', 'Combat Medic'),
          attachments: [
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Canna fluted 16,5"', '16.5" Fluted Barrel'),
            attachment('Impugnatura 6H64 verticale', '6H64 Vertical Grip'),
            attachment('Caricatore 36 colpi', '36rnd Magazine'),
            attachment('Magwell flare', 'Magwell Flare'),
          ],
          gadgets: [
            attachment('Supply Bag / Borsa rifornimenti', 'Supply Bag'),
            attachment('Defibrillatore', 'Defibrillator'),
            attachment('Smoke launcher o smoke', 'Smoke Launcher or Smoke'),
          ],
          engagement: { it: '20-75 m, gioca sempre secondo angolo', en: '20-75 m, always play the second angle' },
          playbook: [
            {
              it: 'Il tuo compagno può prendere spazio solo se tu puoi chiudere revive o trade.',
              en: 'Your partner can take space only if you can close revive or trade.',
            },
            {
              it: 'Non curare nel mezzo della linea: smoke, drag, revive, poi armor.',
              en: 'Do not heal in the open: smoke, drag, revive, then armor.',
            },
            {
              it: "Se siete inseguiti, rallenta il fight con LMG e costringi l'altro team a sprecare plate.",
              en: 'If chased, slow the fight with LMG pressure and force the other team to spend plates.',
            },
          ],
        },
      },
      {
        id: 'engineer-duo',
        callSign: { it: 'Flex AV', en: 'Flex AV' },
        className: { it: 'Geniere', en: 'Engineer' },
        mission: {
          it: 'Default consigliato: proteggere il duo da veicoli e vincere duelli mid range.',
          en: 'Recommended default: protect the duo from vehicles and win mid-range duels.',
        },
        swapRule: {
          it: 'Unica alternativa seria: Recon Spec Ops con SG-553R se la lobby è solo infantry.',
          en: 'Only serious alternative: Recon Spec Ops with SG-553R if the lobby is infantry-only.',
        },
        build: {
          primary: weapons.ak205,
          alternative: weapons.sg553,
          fieldSpec: attachment('Anti-Armour / Anti-corazza', 'Anti-Armour'),
          attachments: [
            attachment('Silenziatore lungo', 'Long Suppressor'),
            attachment('Munizioni Synthetic Tip', 'Synthetic Tip Ammunition'),
            attachment('Ottica 3VZR 1,75x', '3VZR 1.75x'),
            attachment('Caricatore 40 colpi', '40rnd Magazine'),
            attachment('Freno compensato', 'Compensated Brake'),
          ],
          gadgets: [
            attachment('Repair Tool / Strumento riparazione', 'Repair Tool'),
            attachment('Launcher anti-veicolo', 'Anti-Vehicle Launcher'),
            attachment('Mine o utility smoke', 'Mine or Smoke Utility'),
          ],
          engagement: { it: '25-70 m, fight scelti e mai trade inutili', en: '25-70 m, chosen fights and no wasted trades' },
          playbook: [
            {
              it: 'Tu sei il radar dei rischi: veicoli, third-party e angoli non coperti.',
              en: 'You are the risk radar: vehicles, third parties, and uncovered angles.',
            },
            {
              it: 'Se Support cade, non ego-challengeare. Smoke, reposition, revive route.',
              en: 'If Support falls, do not ego-challenge. Smoke, reposition, revive route.',
            },
            {
              it: 'Il duo vince quando rompe armor e forza il team nemico a entrare in due linee di tiro.',
              en: 'The duo wins when it cracks armor and forces the enemy team into two firing lines.',
            },
          ],
        },
      },
    ],
  },
}

export const copy = {
  appName: { it: 'BF6 Bible', en: 'BF6 Bible' },
  redsecQuestion: { it: 'Giochi a REDSEC?', en: 'Playing REDSEC?' },
  dataStatus: { it: 'Seed dati v0.1 - aggiornato 2 maggio 2026', en: 'Data seed v0.1 - updated May 2, 2026' },
  rankedSoon: { it: 'Ranked Quads pronto per Season 3', en: 'Ranked Quads ready for Season 3' },
  mode: { it: 'Modalita', en: 'Mode' },
  squadComp: { it: 'Composizione', en: 'Composition' },
  sourceConfidence: { it: 'Confidenza fonte', en: 'Source confidence' },
  primary: { it: 'Primaria', en: 'Primary' },
  alternative: { it: 'Alternativa', en: 'Alternative' },
  build: { it: 'Build', en: 'Build' },
  gadgets: { it: 'Gadget', en: 'Gadgets' },
  fieldSpec: { it: 'Skill / Field Spec', en: 'Skill / Field Spec' },
  playbook: { it: 'Come giocarla', en: 'How to play it' },
  engagement: { it: 'Range', en: 'Range' },
  swapRule: { it: 'Regola swap', en: 'Swap rule' },
  pressureRules: { it: 'Regole di fight', en: 'Fight rules' },
  metrics: { it: 'Metriche', en: 'Metrics' },
  ttk: { it: 'TTK MP base', en: 'Base MP TTK' },
  stk: { it: 'STK', en: 'STK' },
  redsecUse: { it: 'Uso REDSEC', en: 'REDSEC use' },
  strength: { it: 'Perché funziona', en: 'Why it works' },
  risk: { it: 'Rischio', en: 'Risk' },
  soloLocked: { it: 'Solo: placeholder Season 3', en: 'Solos: Season 3 placeholder' },
  sourceStack: { it: 'Stack fonti', en: 'Source stack' },
}
