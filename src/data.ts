export type Lang = 'it' | 'en'
export type ModeId = 'quads' | 'duos'
export type SourceKind = 'official' | 'sym' | 'community-sheet' | 'comparator' | 'analysis'
export type WeaponSlot = 'primary' | 'secondary'
export type Tier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D'

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
  slot: WeaponSlot
  tier: Tier
  tierReason: Localized
  baselineTtkMs?: number
  baselineStk?: number
  rpm?: number
  magSize?: number
  redsecScore: number
  redsecUse: Localized
  strength: Localized
  risk: Localized
  sourceIds: string[]
  confidence: number
}

export type WeaponKit = {
  metric: WeaponMetric
  attachments: LocalizedTerm[]
}

export type Loadout = {
  id: string
  label: Localized
  summary: Localized
  primary: WeaponKit
  secondary: WeaponKit
  gadgets: LocalizedTerm[]
  fieldSpec: LocalizedTerm
  skills: LocalizedTerm[]
  playbook: Localized[]
  engagement: Localized
  sourceIds: string[]
  confidence: number
}

export type SquadRole = {
  id: string
  callSign: Localized
  className: Localized
  mission: Localized
  loadouts: Loadout[]
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
  {
    id: 'ea-redsec-br101',
    label: 'EA REDSEC Battle Royale 101',
    url: 'https://www.ea.com/games/battlefield/redsec/news/battlefield-redsec-battle-royale-101',
    kind: 'official',
    weight: 1,
    note: {
      it: 'Fonte ufficiale per Custom Weapon Drops, Unique Weapons, rarity e Weapon Upgrade Kits.',
      en: 'Official source for Custom Weapon Drops, Unique Weapons, rarity, and Weapon Upgrade Kits.',
    },
  },
  {
    id: 'pcgamer-custom-loadouts',
    label: 'PC Gamer REDSEC Custom Loadouts',
    url: 'https://www.pcgamer.com/games/fps/battlefield-redsec-custom-weapon-loadouts-battle-royale/',
    kind: 'analysis',
    weight: 0.65,
    note: {
      it: 'Spiega il loop pratico: un custom gun per drop, idealmente due drop per avere due armi custom.',
      en: 'Explains the practical loop: one custom gun per drop, ideally two drops for two custom weapons.',
    },
  },
  {
    id: 'battlefield6gg-catalog',
    label: 'Battlefield6.gg REDSEC Weapon Catalog',
    url: 'https://www.battlefield6.gg/redsec/battlefield-redsec-weapons-list/',
    kind: 'analysis',
    weight: 0.55,
    note: {
      it: 'Catalogo pubblico delle 47 armi REDSEC, incluse sidearm separate.',
      en: 'Public catalog of 47 REDSEC weapons, including separate sidearms.',
    },
  },
]

const term = (it: string, en: string): LocalizedTerm => ({ name: { it, en } })

const weapon = (
  name: string,
  classIt: string,
  classEn: string,
  slot: WeaponSlot,
  tier: Tier,
  redsecScore: number,
  baselineTtkMs: number | undefined,
  baselineStk: number | undefined,
  rpm: number | undefined,
  magSize: number | undefined,
  tierReasonIt: string,
  tierReasonEn: string,
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
  slot,
  tier,
  redsecScore,
  baselineTtkMs,
  baselineStk,
  rpm,
  magSize,
  tierReason: { it: tierReasonIt, en: tierReasonEn },
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
    'primary',
    'S+',
    94,
    300,
    4,
    undefined,
    36,
    'Top REDSEC perché unisce TTK, controllo e valore reale contro armor.',
    'Top REDSEC pick because it combines TTK, control, and real armor value.',
    'Ancora flessibile per mid range e push controllati.',
    'Flexible anchor for mid-range fights and controlled pushes.',
    'ROF alto con recoil gestibile: scala bene con armor e teamfire.',
    'High ROF with manageable recoil: scales well into armor and teamfire.',
    'Richiede disciplina a lunga distanza; usa burst brevi oltre il mid range.',
    'Needs discipline at long range; use short bursts past mid range.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.82,
  ),
  drs: weapon(
    'DRS-IAR',
    'LMG',
    'LMG',
    'primary',
    'S',
    90,
    300,
    4,
    undefined,
    36,
    'Sustain, teamfire e revive cover la rendono quasi obbligatoria in squad.',
    'Sustain, teamfire, and revive cover make it close to mandatory in squad play.',
    'Support anchor per tenere lane, chiudere revive e reggere fight lunghi.',
    'Support anchor for lanes, revive cover, and long fights.',
    'Stabilità, volume di fuoco e ottimo valore in teamfight con armor.',
    'Stability, sustained fire, and strong teamfight value into armor.',
    'Se giochi entry aggressivo, ADS e mobilità puniscono gli errori.',
    'If played as an entry weapon, ADS and mobility punish mistakes.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.79,
  ),
  ak205: weapon(
    'AK-205',
    'Carabina',
    'Carbine',
    'primary',
    'S',
    88,
    333,
    5,
    undefined,
    40,
    'Flex affidabile: meno sexy del KORD, ma molto più stabile nelle rotazioni.',
    'Reliable flex: less flashy than KORD, but more stable during rotations.',
    'Flex weapon per Geniere o Recon che deve vincere duelli a 25-70 m.',
    'Flex weapon for Engineer or Recon winning 25-70 m duels.',
    'Buon controllo e performance pratica sopra il TTK teorico.',
    'Good control and practical performance beyond paper TTK.',
    'Più lenta in close quarters puro contro SMG/AR ad alto ROF.',
    'Slower in pure close quarters against high-ROF SMGs/ARs.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.78,
  ),
  sg553: weapon(
    'SG-553R',
    'Carabina',
    'Carbine',
    'primary',
    'S',
    87,
    300,
    4,
    undefined,
    36,
    'Alternativa flex forte quando la squadra deve muoversi più che tenere lane.',
    'Strong flex alternative when the squad needs movement more than lane holding.',
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
    'primary',
    'S',
    86,
    200,
    4,
    undefined,
    30,
    'Mostruosa da entry, ma il tier scende se il cerchio si apre.',
    'Monster entry gun, but its tier drops when the circle opens up.',
    'Swap da close-range quando il piano è final circle in edifici.',
    'Close-range swap when the plan is building-heavy final circles.',
    'TTK teorico molto rapido e pressione alta da entry.',
    'Very fast theoretical TTK and high entry pressure.',
    'Fuori dal close range diventa una scelta più rischiosa del KORD.',
    'Past close range it is riskier than the KORD.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.72,
  ),
  l110: weapon(
    'L110',
    'LMG',
    'LMG',
    'primary',
    'A',
    82,
    250,
    4,
    undefined,
    36,
    'Ottima quando Support deve muoversi e tradare più velocemente.',
    'Excellent when Support needs to move and trade faster.',
    'Alternativa Support più rapida quando serve tenere pressione senza immobilizzarsi.',
    'Faster Support alternative when pressure matters without becoming static.',
    'TTK vicino molto forte con buona velocity.',
    'Strong close TTK with good velocity.',
    'Meno permissiva della DRS-IAR nei fight prolungati.',
    'Less forgiving than the DRS-IAR in extended fights.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.7,
  ),
  scw: weapon(
    'SCW-10',
    'SMG',
    'SMG',
    'primary',
    'A',
    80,
    300,
    4,
    undefined,
    30,
    'A tier in REDSEC: fortissima nei 20 m, meno universale contro armor a distanza.',
    'A tier in REDSEC: very strong under 20 m, less universal against armor at range.',
    'Opzione close per Geniere aggressivo in bunker, tunnel e finali stretti.',
    'Close option for aggressive Engineer in bunkers, tunnels, and tight endings.',
    'Molto forte quando ogni fight è sotto i 20 metri.',
    'Very strong when every fight happens under 20 meters.',
    'In REDSEC perde valore se devi rompere armor a range aperto.',
    'In REDSEC it loses value when breaking armor in open-range fights.',
    ['sym-bf6', 'sheetonmyface', 'battlefieldmeta'],
    0.74,
  ),
  m39: weapon(
    'M39 EMR',
    'DMR',
    'DMR',
    'primary',
    'A',
    79,
    467,
    3,
    undefined,
    20,
    'A tier per info squad: non è entry, ma converte armor crack e third-party.',
    'A tier for information squads: not entry, but converts armor cracks and third parties.',
    'Pick Recon se la squadra gioca info, third-party e distanza.',
    'Recon pick when the squad plays information, third-party pressure, and range.',
    'Punisce armor rotte e force reposition a media-lunga distanza.',
    'Punishes broken armor and forces reposition at mid-long range.',
    'Meno valore se il duo/quads gioca hard-entry dentro strutture.',
    'Lower value if the squad plays hard-entry inside structures.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.68,
  ),
  m4a1: weapon(
    'M4A1',
    'Carabina',
    'Carbine',
    'primary',
    'A',
    78,
    undefined,
    undefined,
    undefined,
    undefined,
    'Tier alto finché i dati completi confermano handling e TTK pratico.',
    'High tier while complete data keeps confirming handling and practical TTK.',
    'Baseline solida per chi vuole una carabina semplice e controllabile.',
    'Solid baseline for players who want a simple controllable carbine.',
    'Facile da usare, buona in molte distanze.',
    'Easy to use and good across many distances.',
    'Non dà lo stesso valore squad del KORD o della DRS-IAR.',
    'Does not bring the same squad value as KORD or DRS-IAR.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.62,
  ),
  m433: weapon(
    'M433',
    "Fucile d'assalto",
    'Assault Rifle',
    'primary',
    'A',
    77,
    undefined,
    undefined,
    undefined,
    undefined,
    'Buona arma default, ma in REDSEC non supera le opzioni S su armor fights.',
    'Good default weapon, but in REDSEC it does not beat S picks in armor fights.',
    'Pick accessibile per Assault quando mancano unlock avanzati.',
    'Accessible Assault pick when advanced unlocks are missing.',
    'Profilo bilanciato e prevedibile.',
    'Balanced and predictable profile.',
    'Rischia di essere superata da KORD, VCR-2 e carabine top.',
    'Can be outclassed by KORD, VCR-2, and top carbines.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.62,
  ),
  m250: weapon(
    'M250',
    'LMG',
    'LMG',
    'primary',
    'A',
    76,
    undefined,
    undefined,
    undefined,
    undefined,
    'Buona LMG di pressure; serve ingest dati per separarla bene da DRS/L110.',
    'Good pressure LMG; data ingest is needed to separate it from DRS/L110 cleanly.',
    'Alternativa se vuoi volume e controllo in fight lunghi.',
    'Alternative when you want volume and control in long fights.',
    'Tiene pressione e punisce rotate scoperte.',
    'Maintains pressure and punishes exposed rotations.',
    'Meno definita nel ruolo rispetto alle due LMG raccomandate.',
    'Less role-defined than the two recommended LMGs.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.6,
  ),
  sgx: weapon(
    'SGX',
    'SMG',
    'SMG',
    'primary',
    'B',
    71,
    undefined,
    undefined,
    undefined,
    undefined,
    'Forte in MP close, più situazionale in REDSEC per armor e spazi aperti.',
    'Strong in close MP, more situational in REDSEC due to armor and open space.',
    'Close-range puro quando vuoi movimento e hipfire.',
    'Pure close-range when you want movement and hipfire.',
    'Rapidissima in spazi stretti.',
    'Extremely quick in tight spaces.',
    'Crolla se il fight si allunga.',
    'Falls off when the fight extends.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.58,
  ),
  pw7a2: weapon(
    'PW7A2',
    'SMG',
    'SMG',
    'primary',
    'B',
    70,
    undefined,
    undefined,
    undefined,
    undefined,
    'Buona SMG, ma non abbastanza universale per essere pick default REDSEC.',
    'Good SMG, but not universal enough to be a REDSEC default pick.',
    'Close flex per edifici e finali stretti.',
    'Close flex for buildings and tight endings.',
    'Handling e pressione ravvicinata.',
    'Handling and close pressure.',
    'Troppo dipendente dal range.',
    'Too range-dependent.',
    ['sheetonmyface', 'battlefieldmeta'],
    0.57,
  ),
  m2010: weapon(
    'M2010 ESR',
    'Cecchino',
    'Sniper',
    'primary',
    'B',
    68,
    undefined,
    undefined,
    undefined,
    undefined,
    'Sniper utile solo se il team sa convertire informazioni e armor crack.',
    'Sniper is useful only if the team converts information and armor cracks.',
    'Pick da Recon distanza, non da solo highlight.',
    'Recon distance pick, not a solo highlight pick.',
    'Forza riposizionamenti e taglia rotazioni.',
    'Forces repositioning and cuts rotations.',
    'In duo/quads può togliere troppo DPS al team.',
    'In duos/quads it can remove too much team DPS.',
    ['ea-classes', 'battlefieldmeta'],
    0.55,
  ),
  m45a1: weapon(
    'M45A1',
    'Pistola',
    'Pistol',
    'secondary',
    'A',
    78,
    undefined,
    undefined,
    undefined,
    undefined,
    'Sidearm forte, ma non è la seconda arma meta REDSEC: è backup da emergenza.',
    'Default sidearm for finishing broken targets without changing the plan.',
    'Pulizia affidabile dopo primary mag dump.',
    'Reliable cleanup after a primary mag dump.',
    'Buon equilibrio tra controllo e danno.',
    'Good balance of control and damage.',
    'Non deve mai sostituire una primaria nel piano fight.',
    'It must never replace a primary in the fight plan.',
    ['battlefieldmeta'],
    0.6,
  ),
  es57: weapon(
    'ES 5.7',
    'Pistola',
    'Pistol',
    'secondary',
    'B',
    72,
    undefined,
    undefined,
    undefined,
    undefined,
    'Sidearm permissiva; utile come backup, non come vera secondary weapon REDSEC.',
    'More forgiving sidearm when you want ammo and control.',
    'Backup per Geniere/Support in fight disordinati.',
    'Backup for Engineer/Support in messy fights.',
    'Buona gestione colpi e follow-up.',
    'Good ammo control and follow-up.',
    'Meno burst di M44/M45A1.',
    'Less burst than M44/M45A1.',
    ['battlefieldmeta'],
    0.56,
  ),
  m44: weapon(
    'M44',
    'Revolver',
    'Revolver',
    'secondary',
    'A',
    76,
    undefined,
    undefined,
    undefined,
    undefined,
    'High-risk sidearm da Recon: forte per finish, pessima se missi.',
    'High-risk Recon sidearm: strong for finish, poor if you miss.',
    'Finire armor crack a distanza corta dopo DMR/sniper.',
    'Finish armor cracks at short range after DMR/sniper pressure.',
    'Alto danno e deterrenza.',
    'High damage and deterrence.',
    'Punisce mira sporca e panic swap.',
    'Punishes sloppy aim and panic swaps.',
    ['battlefieldmeta'],
    0.54,
  ),
  p18: weapon(
    'P18',
    'Pistola',
    'Pistol',
    'secondary',
    'C',
    60,
    undefined,
    undefined,
    undefined,
    undefined,
    'Usabile come emergenza, ma non è una scelta meta REDSEC.',
    'Usable as emergency backup, but not a REDSEC meta choice.',
    'Solo backup iniziale prima degli unlock migliori.',
    'Early backup before better unlocks.',
    'Accessibile e semplice.',
    'Accessible and simple.',
    'Basso impatto contro armor.',
    'Low impact against armor.',
    ['battlefieldmeta'],
    0.5,
  ),
}

const catalogWeapon = (
  name: string,
  classIt: string,
  classEn: string,
  tier: Tier,
  score: number,
  reasonIt: string,
  reasonEn: string,
) =>
  weapon(
    name,
    classIt,
    classEn,
    classIt === 'Pistola' || classIt === 'Revolver' ? 'secondary' : 'primary',
    tier,
    score,
    undefined,
    undefined,
    undefined,
    undefined,
    reasonIt,
    reasonEn,
    'Catalogata per REDSEC; servono ingest e test TTK per ranking definitivo.',
    'Catalogued for REDSEC; data ingest and TTK tests are needed for final ranking.',
    'Presente nel pool armi REDSEC e candidata per build specifiche.',
    'Present in the REDSEC weapon pool and candidate for specific builds.',
    'Tier provvisorio finché mancano hard-stat complete e patch diff.',
    'Provisional tier until complete hard stats and patch diffs are available.',
    ['ea-redsec-armor', 'battlefieldmeta'],
    0.42,
  )

export const weaponCatalog = {
  b36a4: catalogWeapon('B36A4', "Fucile d'assalto", 'Assault Rifle', 'B', 70, 'AR versatile, da validare rispetto a KORD/M433.', 'Versatile AR, needs validation against KORD/M433.'),
  sor556: catalogWeapon('SOR-556 Mk2', "Fucile d'assalto", 'Assault Rifle', 'A', 77, 'AR accurata da mid-long, potenzialmente forte in REDSEC aperto.', 'Accurate mid-long AR, potentially strong in open REDSEC.'),
  ak4d: catalogWeapon('AK4D', "Fucile d'assalto", 'Assault Rifle', 'B', 69, 'Battle rifle più lento: utile se il danno compensa il ritmo.', 'Slower battle rifle: useful if damage offsets tempo.'),
  tr7: catalogWeapon('TR-7', "Fucile d'assalto", 'Assault Rifle', 'A', 76, 'Close AR interessante, da confrontare con VCR-2/SMG.', 'Interesting close AR, needs comparison with VCR-2/SMGs.'),
  nvo228e: catalogWeapon('NVO-228E', "Fucile d'assalto", 'Assault Rifle', 'B', 70, 'Mid-range affidabile sulla carta, non ancora validata.', 'Paper-reliable mid-range pick, not validated yet.'),
  l85a3: catalogWeapon('L85A3', "Fucile d'assalto", 'Assault Rifle', 'A', 75, 'Stabilità mid-long potenzialmente buona per REDSEC.', 'Potentially good mid-long stability for REDSEC.'),
  m277: catalogWeapon('M277', 'Carabina', 'Carbine', 'B', 70, 'Overmatch a range, ma capacity e handling vanno testati.', 'Range overmatch, but capacity and handling need testing.'),
  m417a2: catalogWeapon('M417 A2', 'Carabina', 'Carbine', 'B', 69, 'Danno alto ma ritmo incerto nel fight armor.', 'High damage but uncertain tempo in armor fights.'),
  grtbc: catalogWeapon('GRT-BC', 'Carabina', 'Carbine', 'B', 70, 'Carabina compatta candidata a flex close-mid.', 'Compact carbine candidate for close-mid flex.'),
  qbz192: catalogWeapon('QBZ-192', 'Carabina', 'Carbine', 'A', 76, 'Carabina da mid range spesso competitiva come flex.', 'Mid-range carbine often competitive as flex.'),
  sor300c: catalogWeapon('SOR-300C', 'Carabina', 'Carbine', 'B', 72, 'Season weapon da testare per suppressed/close-mid.', 'Season weapon to test for suppressed close-mid play.'),
  pw5a3: catalogWeapon('PW5A3', 'SMG', 'SMG', 'B', 71, 'SMG classica: buona secondary close se range è controllato.', 'Classic SMG: good close secondary if range is controlled.'),
  umg40: catalogWeapon('UMG-40', 'SMG', 'SMG', 'B', 68, 'SMG più lenta, valore dipende da danno e controllo.', 'Slower SMG, value depends on damage and control.'),
  usg90: catalogWeapon('USG-90', 'SMG', 'SMG', 'B', 69, 'SMG da capacity/handling, serve TTK test.', 'Capacity/handling SMG, needs TTK testing.'),
  kv9: catalogWeapon('KV9', 'SMG', 'SMG', 'A', 80, 'SMG candidata top per vera secondaria close REDSEC.', 'Top candidate SMG for true close REDSEC secondary.'),
  sl9: catalogWeapon('SL9', 'SMG', 'SMG', 'B', 67, 'SMG da validare: tier prudente finché mancano dati.', 'SMG to validate: conservative tier until data lands.'),
  m60: catalogWeapon('M/60', 'LMG', 'LMG', 'B', 70, 'LMG pesante, forte solo se il team copre mobilità.', 'Heavy LMG, strong only if team covers mobility.'),
  rpkm: catalogWeapon('RPKM', 'LMG', 'LMG', 'B', 72, 'LMG flex da testare contro DRS/L110.', 'Flex LMG to test against DRS/L110.'),
  m123k: catalogWeapon('M123K', 'LMG', 'LMG', 'A', 76, 'Volume di fuoco molto interessante per squad wipe.', 'Very interesting fire volume for squad wipes.'),
  kts100: catalogWeapon('KTS100 MK8', 'LMG', 'LMG', 'A', 78, 'LMG citata spesso nel meta REDSEC; serve validazione numerica.', 'Often mentioned in REDSEC meta; needs numeric validation.'),
  m240l: catalogWeapon('M240L', 'LMG', 'LMG', 'B', 69, 'LMG di pressione, ma peso e ADS possono punire.', 'Pressure LMG, but weight and ADS may punish.'),
  lmr27: catalogWeapon('LMR 27', 'DMR', 'DMR', 'B', 70, 'DMR da info/range, non ancora separata da M39.', 'Info/range DMR, not yet separated from M39.'),
  svk86: catalogWeapon('SVK-8.6', 'DMR', 'DMR', 'B', 71, 'DMR danno alto, da valutare su armor break.', 'High-damage DMR, needs armor-break evaluation.'),
  svdm: catalogWeapon('SVDM', 'DMR', 'DMR', 'A', 75, 'DMR candidato per Recon range e third-party.', 'DMR candidate for Recon range and third parties.'),
  sv98: catalogWeapon('SV-98', 'Cecchino', 'Sniper', 'B', 67, 'Sniper classico, valore dipende da conversione team.', 'Classic sniper, value depends on team conversion.'),
  psr: catalogWeapon('PSR', 'Cecchino', 'Sniper', 'B', 69, 'Sniper accessibile e utile su finali aperti.', 'Accessible sniper useful in open endings.'),
  miniFix: catalogWeapon('Mini Fix', 'Cecchino', 'Sniper', 'B', 68, 'Season sniper da testare per handling e follow-up.', 'Season sniper to test for handling and follow-up.'),
  m87a1: catalogWeapon('M87A1', 'Fucile a pompa', 'Shotgun', 'C', 60, 'Shotgun da edificio: troppo situazionale per default REDSEC.', 'Building shotgun: too situational for REDSEC default.'),
  m1014: catalogWeapon('M1014', 'Fucile a pompa', 'Shotgun', 'B', 66, 'Shotgun semi-auto migliore come secondaria indoor estrema.', 'Semi-auto shotgun better as extreme indoor secondary.'),
  ks185: catalogWeapon('18.5KS-K', 'Fucile a pompa', 'Shotgun', 'C', 59, 'Shotgun situazionale, richiede final circle chiuso.', 'Situational shotgun requiring closed final circles.'),
  ggh22: catalogWeapon('GGH-22', 'Pistola', 'Pistol', 'C', 61, 'Sidearm nuova: catalogata, non vera secondaria REDSEC.', 'New sidearm: catalogued, not a true REDSEC secondary.'),
}

const primaryKit = (metric: WeaponMetric, attachments: LocalizedTerm[]): WeaponKit => ({
  metric,
  attachments,
})

const secondaryKit = (metric: WeaponMetric, attachments: LocalizedTerm[]): WeaponKit => ({
  metric,
  attachments,
})

const loadoutRegistry = new Map<string, Loadout>()

const loadout = (
  id: string,
  labelIt: string,
  labelEn: string,
  summaryIt: string,
  summaryEn: string,
  primary: WeaponKit,
  secondary: WeaponKit,
  fieldSpec: LocalizedTerm,
  skills: LocalizedTerm[],
  gadgets: LocalizedTerm[],
  engagement: Localized,
  playbook: Localized[],
  sourceIds: string[],
  confidence: number,
): Loadout => {
  const entry = {
    id,
    label: { it: labelIt, en: labelEn },
    summary: { it: summaryIt, en: summaryEn },
    primary,
    secondary,
    fieldSpec,
    skills,
    gadgets,
    engagement,
    playbook,
    sourceIds,
    confidence,
  }
  loadoutRegistry.set(id, entry)
  return entry
}

const kits = {
  kordControl: primaryKit(weapons.kord, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Canna Prototype 415 mm', '415mm Prototype Barrel'),
    term('Impugnatura verticale classica', 'Classic Vertical Grip'),
    term('Caricatore 36 colpi', '36rnd Magazine'),
    term('Ottica 3VZR 1,75x', '3VZR 1.75x'),
  ]),
  vcrEntry: primaryKit(weapons.vcr2, [
    term('Compensatore tattico', 'Tactical Compensator'),
    term('Canna corta reattiva', 'Reactive Short Barrel'),
    term('Impugnatura angolata', 'Angled Grip'),
    term('Caricatore rapido', 'Fast Magazine'),
    term('Ottica ROX 1,50x', 'ROX 1.50x'),
  ]),
  drsAnchor: primaryKit(weapons.drs, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Canna fluted 16,5"', '16.5" Fluted Barrel'),
    term('Impugnatura 6H64 verticale', '6H64 Vertical Grip'),
    term('Caricatore 36 colpi', '36rnd Magazine'),
    term('Magwell flare', 'Magwell Flare'),
  ]),
  l110Mobile: primaryKit(weapons.l110, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Canna fluted 16,5"', '16.5" Fluted Barrel'),
    term('Impugnatura 6H64 verticale', '6H64 Vertical Grip'),
    term('Caricatore 36 colpi', '36rnd Magazine'),
    term('Magwell flare', 'Magwell Flare'),
  ]),
  ak205Flex: primaryKit(weapons.ak205, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Munizioni Synthetic Tip', 'Synthetic Tip Ammunition'),
    term('Ottica 3VZR 1,75x', '3VZR 1.75x'),
    term('Caricatore 40 colpi', '40rnd Magazine'),
    term('Freno compensato', 'Compensated Brake'),
  ]),
  scwClose: primaryKit(weapons.scw, [
    term('Compensatore tattico', 'Tactical Compensator'),
    term('Canna corta', 'Short Barrel'),
    term('Laser tattico', 'Tactical Laser'),
    term('Caricatore rapido', 'Fast Magazine'),
    term('Ottica ROX 1,50x', 'ROX 1.50x'),
  ]),
  scwSecondary: secondaryKit(weapons.scw, [
    term('Compensatore tattico', 'Tactical Compensator'),
    term('Canna corta', 'Short Barrel'),
    term('Laser tattico', 'Tactical Laser'),
    term('Caricatore rapido', 'Fast Magazine'),
    term('Ottica ROX 1,50x', 'ROX 1.50x'),
  ]),
  sgxSecondary: secondaryKit(weapons.sgx, [
    term('Compensatore tattico', 'Tactical Compensator'),
    term('Canna corta', 'Short Barrel'),
    term('Laser tattico', 'Tactical Laser'),
    term('Caricatore rapido', 'Fast Magazine'),
    term('Ottica ROX 1,50x', 'ROX 1.50x'),
  ]),
  kv9Secondary: secondaryKit(weaponCatalog.kv9, [
    term('Compensatore tattico', 'Tactical Compensator'),
    term('Canna corta', 'Short Barrel'),
    term('Laser tattico', 'Tactical Laser'),
    term('Caricatore esteso se disponibile', 'Extended Magazine when available'),
    term('Ottica ROX 1,50x', 'ROX 1.50x'),
  ]),
  m39Info: primaryKit(weapons.m39, [
    term('Ottica 3VZR 1,75x o 2,50x', '3VZR 1.75x or 2.50x Scope'),
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Munizioni precisione', 'Precision Ammunition'),
    term('Grip controllo rinculo', 'Recoil Control Grip'),
    term('Caricatore esteso se disponibile', 'Extended Magazine when available'),
  ]),
  sg553Mobile: primaryKit(weapons.sg553, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Canna controllo rinculo', 'Recoil Control Barrel'),
    term('Impugnatura verticale classica', 'Classic Vertical Grip'),
    term('Caricatore 36 colpi', '36rnd Magazine'),
    term('Ottica 3VZR 1,75x', '3VZR 1.75x'),
  ]),
  sg553Secondary: secondaryKit(weapons.sg553, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Canna controllo rinculo', 'Recoil Control Barrel'),
    term('Impugnatura verticale classica', 'Classic Vertical Grip'),
    term('Caricatore 36 colpi', '36rnd Magazine'),
    term('Ottica 3VZR 1,75x', '3VZR 1.75x'),
  ]),
  ak205Secondary: secondaryKit(weapons.ak205, [
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Munizioni Synthetic Tip', 'Synthetic Tip Ammunition'),
    term('Ottica 3VZR 1,75x', '3VZR 1.75x'),
    term('Caricatore 40 colpi', '40rnd Magazine'),
    term('Freno compensato', 'Compensated Brake'),
  ]),
  m2010Range: primaryKit(weapons.m2010, [
    term('Ottica 6x o 8x', '6x or 8x Scope'),
    term('Silenziatore lungo', 'Long Suppressor'),
    term('Munizioni precisione', 'Precision Ammunition'),
    term('Bipod o grip stabilità', 'Bipod or Stability Grip'),
    term('Bolt rapido se disponibile', 'Fast Bolt when available'),
  ]),
}

const skills = {
  frontliner: [
    term('Frontliner / Prima linea', 'Frontliner'),
    term('Rally Squad', 'Rally Squad'),
    term('Adrenaline timing', 'Adrenaline timing'),
  ],
  breacher: [
    term('Breacher / Sfondamento', 'Breacher'),
    term('Entry utility', 'Entry utility'),
    term('Beacon disciplinato', 'Disciplined beacon'),
  ],
  medic: [
    term('Combat Medic / Medico da combattimento', 'Combat Medic'),
    term('Revive sotto smoke', 'Smoke revive'),
    term('Ammo e armor economy', 'Ammo and armor economy'),
  ],
  fireSupport: [
    term('Fire Support / Fuoco di supporto', 'Fire Support'),
    term('Lane suppression', 'Lane suppression'),
    term('Crossfire lento', 'Slow crossfire'),
  ],
  antiArmor: [
    term('Anti-Armour / Anti-corazza', 'Anti-Armour'),
    term('Vehicle denial', 'Vehicle denial'),
    term('Launcher discipline', 'Launcher discipline'),
  ],
  combatEngineer: [
    term('Combat Engineer / Geniere da combattimento', 'Combat Engineer'),
    term('Repair tempo', 'Repair tempo'),
    term('Close defense', 'Close defense'),
  ],
  specOps: [
    term('Spec Ops / Forze speciali', 'Spec Ops'),
    term('Motion info', 'Motion info'),
    term('Rotazioni silenziose', 'Silent rotations'),
  ],
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
      it: 'Un solo entry, un solo anchor, un solo anti-vehicle e un solo info player. Ogni ruolo ha una primaria, una secondaria e una coppia alternativa completa.',
      en: 'One entry, one anchor, one anti-vehicle, and one information player. Every role has one primary, one true secondary weapon, and one complete alternative pair.',
    },
    season3Note: {
      it: 'Season 3 introduce Ranked Battle Royale Quads il 12 maggio 2026. La struttura è pronta per ranking, ma i valori delle armi vanno ricontrollati dopo le note complete.',
      en: 'Season 3 introduces Ranked Battle Royale Quads on May 12, 2026. This structure is ranked-ready, but weapon values need revalidation after full notes.',
    },
    sourceIds: ['ea-redsec-armor', 'ea-redsec-br101', 'pcgamer-custom-loadouts', 'ea-season3', 'ea-classes', 'sym-bf6', 'sheetonmyface'],
    pressureRules: [
      {
        it: 'Se il fight è aperto, non chaseare armor crack: Recon marca, Support tiene crossfire, Geniere controlla veicoli.',
        en: 'If the fight is open, do not chase armor cracks: Recon marks, Support holds crossfire, Engineer controls vehicles.',
      },
      {
        it: "Se il fight è sotto i 20 m, Assault chiama l'ingresso e Support smoke/defib tiene il reset.",
        en: 'If the fight is under 20 m, Assault calls the entry and Support smoke/defib holds the reset.',
      },
      {
        it: 'Un veicolo vicino cambia la priorità: Geniere non fa entry, gioca angoli e conserva utility.',
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
          it: 'Default KORD. Passa a VCR-2 solo se il piano è indoor o final circle stretto.',
          en: 'Default KORD. Swap to VCR-2 only for indoor plans or tight final circles.',
        },
        loadouts: [
          loadout(
            'assault-kord',
            'Meta controllo',
            'Control meta',
            'KORD + SCW-10: primaria mid-range e vera secondaria SMG per chiudere fight sotto i 20 m.',
            'KORD + SCW-10: mid-range primary and true SMG secondary for fights under 20 m.',
            kits.kordControl,
            kits.scwSecondary,
            term('Frontliner / Prima linea', 'Frontliner'),
            skills.frontliner,
            [
              term('Adrenaline Injector', 'Adrenaline Injector'),
              term('Deploy Beacon / Faro di schieramento', 'Deploy Beacon'),
              term('Granata flash o smoke', 'Flash or Smoke Grenade'),
            ],
            { it: '15-55 m, burst corti oltre 45 m', en: '15-55 m, short bursts past 45 m' },
            [
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
            ['ea-classes', 'ea-redsec-armor', 'sym-bf6', 'sheetonmyface'],
            0.82,
          ),
          loadout(
            'assault-vcr',
            'Alternativa close',
            'Close alternative',
            'VCR-2 + SG-553R: entry close con secondaria carbine per non morire appena il fight si apre.',
            'VCR-2 + SG-553R: close entry with carbine secondary so you do not collapse when the fight opens.',
            kits.vcrEntry,
            kits.sg553Secondary,
            term('Breacher / Sfondamento', 'Breacher'),
            skills.breacher,
            [
              term('Adrenaline Injector', 'Adrenaline Injector'),
              term('Deploy Beacon / Faro di schieramento', 'Deploy Beacon'),
              term('Granata flash', 'Flash Grenade'),
            ],
            { it: '5-30 m, non accettare lane lunghe', en: '5-30 m, do not accept long lanes' },
            [
              {
                it: 'Entra solo con utility: flash o smoke prima del wide swing.',
                en: 'Enter only with utility: flash or smoke before the wide swing.',
              },
              {
                it: 'Se il fight si apre, riprendi cover e lascia lavorare Support/Recon.',
                en: 'If the fight opens up, retake cover and let Support/Recon work.',
              },
              {
                it: 'La SG-553R è la tua uscita di sicurezza quando il fight passa da indoor a mid range.',
                en: 'The SG-553R is your safety valve when the fight moves from indoor to mid-range.',
              },
            ],
            ['ea-classes', 'ea-redsec-armor', 'sheetonmyface', 'battlefieldmeta'],
            0.72,
          ),
        ],
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
          it: 'Default DRS-IAR. Passa a L110 se vuoi più mobilità in rotate e trade.',
          en: 'Default DRS-IAR. Swap to L110 when you need more rotation and trade mobility.',
        },
        loadouts: [
          loadout(
            'support-drs',
            'Medic anchor',
            'Medic anchor',
            'DRS-IAR + SCW-10: anchor da revive economy con SMG vera per difendere push ravvicinati.',
            'DRS-IAR + SCW-10: revive economy anchor with true SMG secondary for close push defense.',
            kits.drsAnchor,
            kits.scwSecondary,
            term('Combat Medic / Medico da combattimento', 'Combat Medic'),
            skills.medic,
            [
              term('Supply Bag / Borsa rifornimenti', 'Supply Bag'),
              term('Defibrillatore', 'Defibrillator'),
              term('Smoke launcher o granata smoke', 'Smoke Launcher or Smoke Grenade'),
            ],
            { it: '25-80 m, tieni crossfire e cover revive', en: '25-80 m, hold crossfire and revive cover' },
            [
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
            ['ea-classes', 'ea-redsec-armor', 'sym-bf6', 'sheetonmyface'],
            0.8,
          ),
          loadout(
            'support-l110',
            'Alternativa mobile',
            'Mobile alternative',
            'L110 + SGX: più leggera per squad che ruotano aggressivamente e vogliono close DPS.',
            'L110 + SGX: lighter pair for aggressive rotations and close DPS.',
            kits.l110Mobile,
            kits.sgxSecondary,
            term('Fire Support / Fuoco di supporto', 'Fire Support'),
            skills.fireSupport,
            [
              term('Supply Bag / Borsa rifornimenti', 'Supply Bag'),
              term('Defibrillatore', 'Defibrillator'),
              term('Granata smoke', 'Smoke Grenade'),
            ],
            { it: '15-65 m, pressione continua in movimento', en: '15-65 m, moving sustained pressure' },
            [
              {
                it: 'Gioca più vicino all entry, ma non trasformarti in primo uomo.',
                en: 'Play closer to the entry, but do not become the first man in.',
              },
              {
                it: 'Il reload va coperto: comunica quando perdi volume di fuoco.',
                en: 'Reloads need cover: call when your fire volume drops.',
              },
              {
                it: 'Se il team è rotto, torna immediatamente in modalità medic anchor.',
                en: 'If the team breaks, immediately return to medic-anchor mode.',
              },
            ],
            ['ea-classes', 'ea-redsec-armor', 'sheetonmyface', 'battlefieldmeta'],
            0.72,
          ),
        ],
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
          it: 'Default AK-205. Passa a SCW-10 solo se il cerchio è bunker/tunnel.',
          en: 'Default AK-205. Swap to SCW-10 only when the circle is bunker/tunnel heavy.',
        },
        loadouts: [
          loadout(
            'engineer-ak',
            'Flex AV',
            'Flex AV',
            'AK-205 + KV9: anti-vehicle con SMG secondary per non perdere i duel close.',
            'AK-205 + KV9: anti-vehicle with SMG secondary so close duels are not sacrificed.',
            kits.ak205Flex,
            kits.kv9Secondary,
            term('Anti-Armour / Anti-corazza', 'Anti-Armour'),
            skills.antiArmor,
            [
              term('Repair Tool / Strumento riparazione', 'Repair Tool'),
              term('Launcher anti-veicolo', 'Anti-Vehicle Launcher'),
              term('Mine anti-veicolo o utility smoke', 'Anti-Vehicle Mine or Smoke Utility'),
            ],
            { it: '25-70 m infantry, utility vs veicoli', en: '25-70 m infantry, utility against vehicles' },
            [
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
            ['ea-classes', 'ea-redsec-armor', 'sym-bf6', 'sheetonmyface'],
            0.78,
          ),
          loadout(
            'engineer-scw',
            'Alternativa bunker',
            'Bunker alternative',
            'SCW-10 + AK-205: secondaria mid-range per quando esci dal bunker o devi ruotare.',
            'SCW-10 + AK-205: mid-range secondary for leaving bunkers or rotating.',
            kits.scwClose,
            kits.ak205Secondary,
            term('Combat Engineer / Geniere da combattimento', 'Combat Engineer'),
            skills.combatEngineer,
            [
              term('Repair Tool / Strumento riparazione', 'Repair Tool'),
              term('Launcher anti-veicolo', 'Anti-Vehicle Launcher'),
              term('Granata smoke', 'Smoke Grenade'),
            ],
            { it: '5-25 m, angoli stretti e cover dura', en: '5-25 m, tight angles and hard cover' },
            [
              {
                it: 'Vinci tenendo angoli sporchi, non inseguendo player in campo aperto.',
                en: 'Win by holding dirty angles, not by chasing players in the open.',
              },
              {
                it: 'La build close non ti libera dal dovere anti-veicolo.',
                en: 'The close build does not remove your anti-vehicle duty.',
              },
              {
                it: 'Se il cerchio si apre, torna AK-205 appena possibile.',
                en: 'If the circle opens up, return to AK-205 as soon as possible.',
              },
            ],
            ['ea-classes', 'ea-redsec-armor', 'sym-bf6', 'battlefieldmeta'],
            0.72,
          ),
        ],
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
          it: 'Default M39 se giochi info e distanza. SG-553R se il cerchio obbliga movimento.',
          en: 'Default M39 for information and range. SG-553R when the circle forces movement.',
        },
        loadouts: [
          loadout(
            'recon-m39',
            'Info DMR',
            'Info DMR',
            'M39 EMR + SG-553R: info/range con seconda arma vera per trade e wipe in movimento.',
            'M39 EMR + SG-553R: info/range with a true second weapon for moving trades and wipes.',
            kits.m39Info,
            kits.sg553Secondary,
            term('Spec Ops / Forze speciali', 'Spec Ops'),
            skills.specOps,
            [
              term('Motion Sensor / Sensore movimento', 'Motion Sensor'),
              term('Recon Drone', 'Recon Drone'),
              term('Tracer Dart o Demolition Charge', 'Tracer Dart or Demolition Charge'),
            ],
            { it: '35-110 m, info prima del danno', en: '35-110 m, information before damage' },
            [
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
            ['ea-classes', 'ea-redsec-armor', 'sheetonmyface', 'battlefieldmeta'],
            0.68,
          ),
          loadout(
            'recon-sniper-smg',
            'Sniper + SMG',
            'Sniper + SMG',
            'M2010 ESR + SCW-10: sniper solo se hai una SMG reale per sopravvivere al push.',
            'M2010 ESR + SCW-10: sniper only if you carry a real SMG to survive the push.',
            kits.m2010Range,
            kits.scwSecondary,
            term('Spec Ops / Forze speciali', 'Spec Ops'),
            skills.specOps,
            [
              term('Motion Sensor / Sensore movimento', 'Motion Sensor'),
              term('Recon Drone', 'Recon Drone'),
              term('Granata smoke', 'Smoke Grenade'),
            ],
            { it: '0-25 m con SMG, 70+ m con sniper', en: '0-25 m with SMG, 70+ m with sniper' },
            [
              {
                it: 'Usa motion info per entrare secondo, mai per ego-push ciechi.',
                en: 'Use motion info to enter second, never for blind ego-pushes.',
              },
              {
                it: 'La SCW-10 è obbligatoria: senza SMG sei morto appena qualcuno ti pusha.',
                en: 'The SCW-10 is mandatory: without an SMG you die as soon as someone pushes you.',
              },
              {
                it: 'Se perdi visione, rallenta: senza info sei solo un secondo Assault.',
                en: 'If you lose vision, slow down: without info you are just a second Assault.',
              },
            ],
            ['ea-classes', 'ea-redsec-armor', 'sym-bf6', 'sheetonmyface'],
            0.74,
          ),
        ],
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
        it: 'Geniere è la scelta default se la lobby usa mezzi; Recon è il default se la lobby è infantry-heavy.',
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
          it: 'Default DRS-IAR. L110 solo se il duo gioca molto mobile.',
          en: 'Default DRS-IAR. L110 only when the duo plays very mobile.',
        },
        loadouts: [
          modePlansPlaceholder('support-drs'),
          modePlansPlaceholder('support-l110'),
        ],
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
        loadouts: [
          modePlansPlaceholder('engineer-ak'),
          modePlansPlaceholder('recon-m39'),
        ],
      },
    ],
  },
}

function modePlansPlaceholder(loadoutId: string): Loadout {
  const found = loadoutRegistry.get(loadoutId)
  if (!found) {
    throw new Error(`Missing loadout ${loadoutId}`)
  }
  return found
}

export const metaWeapons = [...Object.values(weapons), ...Object.values(weaponCatalog)].sort((a, b) => {
  const tierRank: Record<Tier, number> = { 'S+': 0, S: 1, A: 2, B: 3, C: 4, D: 5 }
  return tierRank[a.tier] - tierRank[b.tier] || b.redsecScore - a.redsecScore
})

export const copy = {
  appName: { it: 'BF6 Bible', en: 'BF6 Bible' },
  mainNavigation: { it: 'Navigazione principale', en: 'Main navigation' },
  redsecPlanner: { it: 'Planner REDSEC', en: 'REDSEC planner' },
  metaPage: { it: 'Meta armi', en: 'Weapon meta' },
  redsecQuestion: { it: 'Giochi a REDSEC?', en: 'Playing REDSEC?' },
  dataStatus: { it: 'Seed dati v0.2 - aggiornato 2 maggio 2026', en: 'Data seed v0.2 - updated May 2, 2026' },
  rankedSoon: { it: 'Ranked Quads pronto per Season 3', en: 'Ranked Quads ready for Season 3' },
  mode: { it: 'Modalità', en: 'Mode' },
  squadComp: { it: 'Composizione', en: 'Composition' },
  sourceConfidence: { it: 'Confidenza fonte', en: 'Source confidence' },
  primary: { it: 'Primaria', en: 'Primary' },
  secondary: { it: 'Secondaria arma', en: 'Secondary weapon' },
  alternativeLoadout: { it: 'Loadout alternativo', en: 'Alternative loadout' },
  chooseLoadout: { it: 'Scegli loadout', en: 'Choose loadout' },
  buildPrimary: { it: 'Build primaria', en: 'Primary build' },
  buildSecondary: { it: 'Build seconda arma', en: 'Secondary weapon build' },
  build: { it: 'Build', en: 'Build' },
  gadgets: { it: 'Gadget', en: 'Gadgets' },
  fieldSpec: { it: 'Field Spec', en: 'Field Spec' },
  recommendedSkills: { it: 'Skill consigliate', en: 'Recommended skills' },
  playbook: { it: 'Come giocarla', en: 'How to play it' },
  engagement: { it: 'Range', en: 'Range' },
  swapRule: { it: 'Regola swap', en: 'Swap rule' },
  pressureRules: { it: 'Regole di fight', en: 'Fight rules' },
  metrics: { it: 'Metriche', en: 'Metrics' },
  ttk: { it: 'TTK MP base', en: 'Base MP TTK' },
  stk: { it: 'STK', en: 'STK' },
  rpm: { it: 'RPM', en: 'RPM' },
  mag: { it: 'Mag', en: 'Mag' },
  redsecUse: { it: 'Uso REDSEC', en: 'REDSEC use' },
  strength: { it: 'Perché funziona', en: 'Why it works' },
  risk: { it: 'Rischio', en: 'Risk' },
  tierReason: { it: 'Razionale tier', en: 'Tier rationale' },
  redsecScore: { it: 'REDSEC score', en: 'REDSEC score' },
  metaTier: { it: 'Meta Tier armi', en: 'Weapon Meta Tier' },
  metaTierSubtitle: {
    it: 'Tier REDSEC v0.2: combina TTK/STK dove disponibili, controllo, armor value, range reale e ruolo in squad.',
    en: 'REDSEC tier v0.2: combines TTK/STK where available, control, armor value, real range, and squad role.',
  },
  metaFilter: { it: 'Filtro meta armi', en: 'Weapon meta filter' },
  weaponsShown: { it: 'armi mostrate', en: 'weapons shown' },
  soloLocked: { it: 'Solo: placeholder Season 3', en: 'Solos: Season 3 placeholder' },
  sourceStack: { it: 'Stack fonti', en: 'Source stack' },
}
