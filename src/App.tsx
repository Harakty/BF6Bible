import {
  Activity,
  BarChart3,
  ClipboardList,
  Crosshair,
  Database,
  ExternalLink,
  Gauge,
  Languages,
  Layers,
  Radar,
  Shield,
  Stethoscope,
  Target,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  solvedBuildForWeapon,
  solvedBuildPointLabel,
  solvedBuilds,
  type SolvedAttachment,
  type SolvedBuild,
} from './buildEngine'
import {
  copy,
  metaWeapons,
  modePlans,
  sources,
  type Lang,
  type Localized,
  type LocalizedTerm,
  type ModeId,
  type Source,
  type WeaponKit,
  type WeaponMetric,
} from './data'
import { getMetaScenario, metaScenarios, rankWeapons, type MetaScenarioId } from './metaEngine'
import { generatedStatForName, generatedWeaponStats, type GeneratedWeaponStat } from './weaponStats'

type ViewId = 'planner' | 'meta'
type WeaponTypeFilterId = 'all' | GeneratedWeaponStat['categoryKey']

type WeaponTypeOption = {
  id: WeaponTypeFilterId
  label: Localized
}

const sourceMap = new Map(sources.map((source) => [source.id, source]))

const weaponTypeLabelByKey = new Map<GeneratedWeaponStat['categoryKey'], Localized>()
for (const weapon of generatedWeaponStats.weapons) {
  if (!weaponTypeLabelByKey.has(weapon.categoryKey)) {
    weaponTypeLabelByKey.set(weapon.categoryKey, weapon.className)
  }
}

const weaponTypeOptions: WeaponTypeOption[] = [
  { id: 'all', label: { it: 'Tutti i tipi', en: 'All types' } },
  ...Array.from(weaponTypeLabelByKey.entries()).map(([id, label]) => ({ id, label })),
]

function weaponTypeKeyForMetric(metric: WeaponMetric) {
  const stat = generatedStatForName(metric.weapon.name.en)
  if (stat) return stat.categoryKey

  const className = metric.className.en.toLowerCase()
  return weaponTypeOptions.find((option) => option.id !== 'all' && option.label.en.toLowerCase() === className)?.id
}

const tacticalPlans = {
  quads: {
    title: { it: 'Schema Quads: diamante 12-18 m', en: 'Quads shape: 12-18 m diamond' },
    caption: {
      it: 'Entry prende contatto, Supporto tiene reset, Geniere controlla veicoli/flank, Ricognitore mantiene off-angle e ping.',
      en: 'Entry takes contact, Support holds reset, Engineer controls vehicles/flanks, Recon keeps off-angle and pings.',
    },
    nodes: [
      { id: 'entry', label: { it: 'Assalto', en: 'Assault' }, sub: { it: 'Entry', en: 'Entry' }, x: 350, y: 128 },
      { id: 'support', label: { it: 'Supporto', en: 'Support' }, sub: { it: 'Reset', en: 'Reset' }, x: 250, y: 188 },
      { id: 'engineer', label: { it: 'Geniere', en: 'Engineer' }, sub: { it: 'AV / flank', en: 'AV / flank' }, x: 148, y: 158 },
      { id: 'recon', label: { it: 'Ricognitore', en: 'Recon' }, sub: { it: 'Info', en: 'Info' }, x: 454, y: 76 },
    ],
    calls: [
      {
        it: 'Assalto non chasea armor crack senza crossfire: chiama target e distanza.',
        en: 'Assault does not chase armor cracks without crossfire: call target and distance.',
      },
      {
        it: 'Supporto gioca dietro la prima linea: smoke e revive valgono più del trade ego.',
        en: 'Support plays behind the first line: smoke and revive are worth more than ego trades.',
      },
      {
        it: "Ricognitore e Geniere non duplicano angoli: uno legge rotazioni, l'altro chiude veicoli/flank.",
        en: 'Recon and Engineer do not duplicate angles: one reads rotations, the other closes vehicles/flanks.',
      },
    ],
  },
  duos: {
    title: { it: 'Schema Duos: coppia elastica 8-14 m', en: 'Duos shape: 8-14 m elastic pair' },
    caption: {
      it: "Supporto è l'ancora. Il flex prende primo angolo, rompe armor e torna in linea prima che il fight diventi 2v4.",
      en: 'Support is the anchor. Flex takes first angle, breaks armor, and returns to line before the fight becomes 2v4.',
    },
    nodes: [
      { id: 'support', label: { it: 'Supporto', en: 'Support' }, sub: { it: 'Anchor', en: 'Anchor' }, x: 260, y: 184 },
      { id: 'engineer', label: { it: 'Flex', en: 'Flex' }, sub: { it: 'Geniere / Recon', en: 'Engineer / Recon' }, x: 382, y: 126 },
    ],
    calls: [
      {
        it: 'Se il primo trade fallisce, il duo resetta: niente push lunghi senza revive line.',
        en: 'If the first trade fails, the duo resets: no long push without revive line.',
      },
      {
        it: 'Il flex sceglie Geniere contro veicoli, Ricognitore quando lobby e cerchio sono infantry-heavy.',
        en: 'Flex chooses Engineer into vehicles, Recon when lobby and circle are infantry-heavy.',
      },
      {
        it: 'La distanza giusta è abbastanza larga per crossfire, abbastanza corta per revive.',
        en: 'The right spacing is wide enough for crossfire, short enough for revive.',
      },
    ],
  },
} satisfies Record<
  ModeId,
  {
    title: Localized
    caption: Localized
    nodes: Array<{ id: string; label: Localized; sub: Localized; x: number; y: number }>
    calls: Localized[]
  }
>

function t(value: Localized, lang: Lang) {
  return value[lang]
}

function otherLang(lang: Lang): Lang {
  return lang === 'it' ? 'en' : 'it'
}

function formatMs(value?: number) {
  return value !== undefined ? `${value} ms` : '—'
}

function formatNumber(value?: number) {
  return value !== undefined ? String(value) : '—'
}

function attachmentPointTotal(items: LocalizedTerm[]) {
  if (!items.length || items.some((item) => item.points === undefined)) return undefined
  return items.reduce((sum, item) => sum + (item.points ?? 0), 0)
}

function formatAttachmentPoints(items: LocalizedTerm[]) {
  const total = attachmentPointTotal(items)
  return total !== undefined ? `${total}/100` : undefined
}

function roleIcon(roleId: string) {
  if (roleId.includes('support')) return <Stethoscope aria-hidden="true" />
  if (roleId.includes('engineer')) return <Wrench aria-hidden="true" />
  if (roleId.includes('recon')) return <Radar aria-hidden="true" />
  return <Zap aria-hidden="true" />
}

function Term({ value, lang }: { value: LocalizedTerm; lang: Lang }) {
  const alt = t(value.name, otherLang(lang))
  const main = t(value.name, lang)
  const cost = value.points !== undefined ? ` (${value.points})` : ''

  return (
    <span className={value.verified === false ? 'term unverified' : 'term'}>
      <span>
        {main}
        {cost}
      </span>
      {alt !== main ? <small>{alt}</small> : null}
    </span>
  )
}

function AttachmentBlock({
  title,
  kit,
  lang,
  highlighted = false,
}: {
  title: Localized
  kit: WeaponKit
  lang: Lang
  highlighted?: boolean
}) {
  const points = formatAttachmentPoints(kit.attachments)

  return (
    <section className={highlighted ? 'build-section highlighted' : 'build-section'}>
      <h3 className="build-heading">
        <span>
          {t(title, lang)} · {t(kit.metric.weapon.name, lang)}
        </span>
        {points ? <small>{points}</small> : <small>{t(copy.buildPending, lang)}</small>}
      </h3>
      <div className="chips">
        {kit.attachments.map((item) => (
          <Term key={`${item.name.it}-${item.name.en}`} lang={lang} value={item} />
        ))}
      </div>
    </section>
  )
}

function SolvedAttachmentTerm({ value, lang }: { value: SolvedAttachment; lang: Lang }) {
  return <Term lang={lang} value={{ name: value.name, points: value.points }} />
}

function SourcePill({ source, lang }: { source: Source; lang: Lang }) {
  return (
    <a className={`source-pill ${source.kind}`} href={source.url} target="_blank" rel="noreferrer">
      <span>{source.label}</span>
      <ExternalLink aria-hidden="true" />
      <span className="sr-only">{t(source.note, lang)}</span>
    </a>
  )
}

function TacticalDiagram({ mode, lang }: { mode: ModeId; lang: Lang }) {
  const plan = tacticalPlans[mode]
  return (
    <figure className="tactical-diagram">
      <div className="tactical-board">
        <svg viewBox="0 0 640 320" role="img" aria-label={t(plan.title, lang)}>
          <defs>
            <marker id={`arrow-${mode}`} markerHeight="8" markerWidth="8" orient="auto" refX="8" refY="4">
              <path d="M0,0 L8,4 L0,8 Z" />
            </marker>
          </defs>
          <rect className="map-sector sector-left" x="72" y="56" width="168" height="118" />
          <rect className="map-sector sector-right" x="394" y="126" width="176" height="112" />
          <path className="route-line push-line" d="M122 232 C210 194 290 148 396 104" markerEnd={`url(#arrow-${mode})`} />
          <path className="route-line reset-line" d="M440 226 C350 206 276 218 190 260" markerEnd={`url(#arrow-${mode})`} />
          <path className="route-line cross-line" d="M150 108 C260 134 356 170 496 206" />
          <circle className="objective-ring" cx="318" cy="164" r="52" />
          <text className="objective-label" x="318" y="168">
            OBJ
          </text>
          {plan.nodes.map((node) => (
            <g className={`role-node ${node.id}`} key={node.id} transform={`translate(${node.x} ${node.y})`}>
              <circle r="22" />
              <text className="node-label" x="0" y="-31">
                {t(node.label, lang)}
              </text>
              <text className="node-sub" x="0" y="43">
                {t(node.sub, lang)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption>
        <strong>{t(plan.title, lang)}</strong>
        <span>{t(plan.caption, lang)}</span>
        <ul>
          {plan.calls.map((call) => (
            <li key={call.en}>{t(call, lang)}</li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}

function CommandBoardVisual({ mode, lang }: { mode: ModeId; lang: Lang }) {
  const title =
    mode === 'quads'
      ? { it: 'Command board REDSEC Quads', en: 'REDSEC Quads command board' }
      : { it: 'Command board REDSEC Duos', en: 'REDSEC Duos command board' }
  const roleNodes =
    mode === 'quads'
      ? [
          { id: 'entry', label: { it: 'Assalto', en: 'Assault' }, x: 318, y: 92 },
          { id: 'support', label: { it: 'Supporto', en: 'Support' }, x: 238, y: 168 },
          { id: 'engineer', label: { it: 'Geniere', en: 'Engineer' }, x: 394, y: 176 },
          { id: 'recon', label: { it: 'Ricognitore', en: 'Recon' }, x: 312, y: 242 },
        ]
      : [
          { id: 'support', label: { it: 'Supporto', en: 'Support' }, x: 262, y: 182 },
          { id: 'engineer', label: { it: 'Flex', en: 'Flex' }, x: 388, y: 128 },
        ]

  return (
    <figure className="command-board" aria-label={t(title, lang)}>
      <svg viewBox="0 0 640 360" role="img" aria-labelledby={`command-board-title-${mode}`}>
        <title id={`command-board-title-${mode}`}>{t(title, lang)}</title>
        <defs>
          <radialGradient id={`boardGlow-${mode}`} cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="rgba(229, 106, 84, 0.32)" />
            <stop offset="55%" stopColor="rgba(120, 208, 138, 0.08)" />
            <stop offset="100%" stopColor="rgba(16, 19, 17, 0)" />
          </radialGradient>
        </defs>
        <rect className="board-frame" x="14" y="14" width="612" height="332" rx="10" />
        <path className="board-terrain" d="M34 214 C120 158 168 206 254 146 C330 92 382 104 474 76 C526 60 568 68 610 42" />
        <path className="board-terrain soft" d="M34 278 C118 238 178 268 254 222 C340 170 412 212 490 170 C540 144 582 146 610 118" />
        <circle className="board-core" cx="320" cy="178" r="58" />
        <circle className="board-core inner" cx="320" cy="178" r="19" />
        <path className="board-lane lane-entry" d="M320 74 L320 158" />
        <path className="board-lane lane-support" d="M228 168 C260 164 284 170 306 178" />
        <path className="board-lane lane-engineer" d="M414 174 C388 166 362 170 334 178" />
        <path className="board-lane lane-recon" d="M312 258 C316 230 318 206 320 188" />
        <path className="board-sweep sweep-a" d="M110 96 C210 132 264 164 320 178 C398 198 466 186 554 140" />
        <path className="board-sweep sweep-b" d="M96 258 C188 214 254 200 320 178 C396 152 470 118 556 82" />
        <rect className="side-module module-left" x="34" y="44" width="124" height="102" rx="6" />
        <rect className="side-module module-left small" x="34" y="164" width="124" height="74" rx="6" />
        <rect className="side-module module-right" x="482" y="44" width="124" height="102" rx="6" />
        <rect className="side-module module-right small" x="482" y="164" width="124" height="74" rx="6" />
        <rect className="bottom-module" x="74" y="294" width="92" height="24" rx="5" />
        <rect className="bottom-module" x="188" y="294" width="92" height="24" rx="5" />
        <rect className="bottom-module" x="302" y="294" width="92" height="24" rx="5" />
        <rect className="bottom-module" x="416" y="294" width="92" height="24" rx="5" />
        <circle className="board-glow" cx="320" cy="178" r="164" fill={`url(#boardGlow-${mode})`} />
        {roleNodes.map((node) => (
          <g className={`board-node ${node.id}`} key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <circle r="24" />
            <circle r="8" />
            <text x="0" y="44">
              {t(node.label, lang)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

function AppHeader({
  lang,
  setLang,
  view,
  setView,
}: {
  lang: Lang
  setLang: (lang: Lang) => void
  view: ViewId
  setView: (view: ViewId) => void
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <Shield aria-hidden="true" />
        <div>
          <strong>{t(copy.appName, lang)}</strong>
          <span>{t(copy.dataStatus, lang)}</span>
        </div>
      </div>
      <nav className="app-nav" aria-label={t(copy.mainNavigation, lang)}>
        <button
          className={view === 'planner' ? 'active' : ''}
          type="button"
          aria-pressed={view === 'planner'}
          onClick={() => setView('planner')}
        >
          <ClipboardList aria-hidden="true" />
          <span>{t(copy.redsecPlanner, lang)}</span>
        </button>
        <button
          className={view === 'meta' ? 'active' : ''}
          type="button"
          aria-pressed={view === 'meta'}
          onClick={() => setView('meta')}
        >
          <BarChart3 aria-hidden="true" />
          <span>{t(copy.metaPage, lang)}</span>
        </button>
      </nav>
      <div className="top-actions">
        <button
          className="language-toggle"
          type="button"
          onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
          aria-label="Toggle language"
        >
          <Languages aria-hidden="true" />
          <span>{lang === 'it' ? 'IT' : 'EN'}</span>
        </button>
      </div>
    </header>
  )
}

function ModeSelector({
  lang,
  selectedMode,
  setSelectedMode,
}: {
  lang: Lang
  selectedMode: ModeId
  setSelectedMode: (mode: ModeId) => void
}) {
  return (
    <section className="mode-band">
      <div className="mode-copy">
        <p>{t(copy.redsecQuestion, lang)}</p>
        <h1>{t(modePlans[selectedMode].title, lang)}</h1>
        <span>{t(modePlans[selectedMode].subtitle, lang)}</span>
      </div>
      <div className="mode-action-panel">
        <CommandBoardVisual lang={lang} mode={selectedMode} />
        <div className="mode-controls" aria-label={t(copy.mode, lang)}>
          {(['quads', 'duos'] as ModeId[]).map((mode) => (
            <button
              className={selectedMode === mode ? 'active' : ''}
              key={mode}
              type="button"
              onClick={() => setSelectedMode(mode)}
            >
              {mode === 'quads' ? <Users aria-hidden="true" /> : <Target aria-hidden="true" />}
              <span>{t(modePlans[mode].title, lang)}</span>
            </button>
          ))}
          <button className="locked" type="button" disabled>
            <Crosshair aria-hidden="true" />
            <span>{t(copy.soloLocked, lang)}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function WeaponPanel({
  lang,
  metric,
  label,
  variant = 'primary',
}: {
  lang: Lang
  metric: WeaponMetric
  label: Localized
  variant?: 'primary' | 'secondary'
}) {
  return (
    <div className={variant === 'secondary' ? 'weapon-panel secondary' : 'weapon-panel'}>
      <div className="weapon-head">
        <span>{t(label, lang)}</span>
        <strong>{t(metric.weapon.name, lang)}</strong>
        <small>{t(metric.className, lang)}</small>
      </div>
      <div className="metric-strip">
        <div>
          <span>{t(copy.ttk, lang)}</span>
          <strong>{formatMs(metric.baselineTtkMs)}</strong>
        </div>
        <div>
          <span>{t(copy.stk, lang)}</span>
          <strong>{formatNumber(metric.baselineStk)}</strong>
        </div>
        <div>
          <span>{t(copy.redsecScore, lang)}</span>
          <strong>{metric.redsecScore}</strong>
        </div>
      </div>
      <div className="metric-strip compact">
        <div>
          <span>{t(copy.rpm, lang)}</span>
          <strong>{formatNumber(metric.rpm)}</strong>
        </div>
        <div>
          <span>{t(copy.mag, lang)}</span>
          <strong>{formatNumber(metric.magSize)}</strong>
        </div>
      </div>
      <dl className="weapon-notes">
        <div>
          <dt>{t(copy.tierReason, lang)}</dt>
          <dd>{t(metric.tierReason, lang)}</dd>
        </div>
        <div>
          <dt>{t(copy.redsecUse, lang)}</dt>
          <dd>{t(metric.redsecUse, lang)}</dd>
        </div>
        <div>
          <dt>{t(copy.strength, lang)}</dt>
          <dd>{t(metric.strength, lang)}</dd>
        </div>
        <div>
          <dt>{t(copy.risk, lang)}</dt>
          <dd>{t(metric.risk, lang)}</dd>
        </div>
      </dl>
    </div>
  )
}

function RoleCard({ role, lang }: { role: (typeof modePlans)[ModeId]['roles'][number]; lang: Lang }) {
  const [selectedLoadoutId, setSelectedLoadoutId] = useState(role.loadouts[0].id)
  const activeLoadout = role.loadouts.find((loadout) => loadout.id === selectedLoadoutId) ?? role.loadouts[0]

  const roleSources = Array.from(
    new Set([
      ...activeLoadout.primary.metric.sourceIds,
      ...activeLoadout.secondary.metric.sourceIds,
      ...activeLoadout.sourceIds,
      'ea-classes',
      'ea-redsec-armor',
    ]),
  )
    .map((id) => sourceMap.get(id))
    .filter((source): source is Source => Boolean(source))

  return (
    <article className="role-card">
      <div className="role-title">
        <div className="role-icon">{roleIcon(role.id)}</div>
        <div>
          <span>{t(role.className, lang)}</span>
          <h2>{t(role.callSign, lang)}</h2>
        </div>
      </div>
      <p className="mission">{t(role.mission, lang)}</p>

      <div className="loadout-switcher" aria-label={t(copy.chooseLoadout, lang)}>
        <div className="switcher-label">
          <Layers aria-hidden="true" />
          <span>{t(copy.chooseLoadout, lang)}</span>
        </div>
        <div className="loadout-buttons">
          {role.loadouts.map((loadout, index) => (
            <button
              className={activeLoadout.id === loadout.id ? 'active' : ''}
              key={loadout.id}
              type="button"
              onClick={() => setSelectedLoadoutId(loadout.id)}
            >
              <span>{index === 0 ? t(copy.primary, lang) : t(copy.alternativeLoadout, lang)}</span>
              <strong>{t(loadout.label, lang)}</strong>
              <em>
                {t(loadout.primary.metric.weapon.name, lang)} + {t(loadout.secondary.metric.weapon.name, lang)}
              </em>
            </button>
          ))}
        </div>
      </div>

      <p className="loadout-summary">{t(activeLoadout.summary, lang)}</p>

      <div className="role-grid">
        <WeaponPanel lang={lang} label={copy.primary} metric={activeLoadout.primary.metric} />
        <WeaponPanel lang={lang} label={copy.secondary} metric={activeLoadout.secondary.metric} variant="secondary" />
      </div>

      <div className="build-grid">
        <AttachmentBlock kit={activeLoadout.primary} lang={lang} title={copy.buildPrimary} />
        <AttachmentBlock kit={activeLoadout.secondary} lang={lang} title={copy.buildSecondary} />
        <section>
          <h3>{t(copy.gadgets, lang)}</h3>
          <div className="chips">
            {activeLoadout.gadgets.map((item) => (
              <Term key={`${item.name.it}-${item.name.en}`} lang={lang} value={item} />
            ))}
          </div>
        </section>
        <section>
          <h3>{t(copy.fieldSpec, lang)}</h3>
          <div className="chips single">
            <Term lang={lang} value={activeLoadout.fieldSpec} />
          </div>
        </section>
        <section>
          <h3>{t(copy.recommendedSkills, lang)}</h3>
          <div className="chips">
            {activeLoadout.skills.map((item) => (
              <Term key={`${item.name.it}-${item.name.en}`} lang={lang} value={item} />
            ))}
          </div>
        </section>
        <section>
          <h3>{t(copy.engagement, lang)}</h3>
          <p>{t(activeLoadout.engagement, lang)}</p>
        </section>
      </div>

      <div className="playbook">
        <h3>{t(copy.playbook, lang)}</h3>
        <ol>
          {activeLoadout.playbook.map((line) => (
            <li key={line.en}>{t(line, lang)}</li>
          ))}
        </ol>
      </div>

      {role.swapRule ? (
        <div className="swap-rule">
          <Gauge aria-hidden="true" />
          <span>
            <strong>{t(copy.swapRule, lang)}:</strong> {t(role.swapRule, lang)}
          </span>
        </div>
      ) : null}

      <div className="source-row">
        {roleSources.slice(0, 4).map((source) => (
          <SourcePill key={source.id} source={source} lang={lang} />
        ))}
      </div>
    </article>
  )
}

function PlanSummary({ mode, lang }: { mode: ModeId; lang: Lang }) {
  const plan = modePlans[mode]
  const planSources = plan.sourceIds
    .map((id) => sourceMap.get(id))
    .filter((source): source is Source => Boolean(source))

  return (
    <section className="summary-band">
      <div className="summary-main">
        <div className="summary-label">
          <Database aria-hidden="true" />
          <span>{t(copy.squadComp, lang)}</span>
        </div>
        <h2>{t(plan.squadLogic, lang)}</h2>
        <div className="summary-stats">
          <div>
            <span>REDSEC armor</span>
            <strong>80 HP</strong>
          </div>
          <div>
            <span>{t(copy.rankedSoon, lang)}</span>
            <strong>12 May</strong>
          </div>
        </div>
      </div>
      <TacticalDiagram lang={lang} mode={mode} />
      <div className="rules-panel">
        <h3>{t(copy.pressureRules, lang)}</h3>
        <ul>
          {plan.pressureRules.map((rule) => (
            <li key={rule.en}>
              <Activity aria-hidden="true" />
              <span>{t(rule, lang)}</span>
            </li>
          ))}
        </ul>
        <p>{t(plan.season3Note, lang)}</p>
      </div>
      <div className="source-stack">
        <h3>{t(copy.sourceStack, lang)}</h3>
        <div>
          {planSources.map((source) => (
            <SourcePill key={source.id} source={source} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}

type SolvedBuildLink = {
  key: string
  kind: 'solved'
  build: SolvedBuild
}

function SolvedMetaBuildPanel({ build, lang }: { build: SolvedBuild; lang: Lang }) {
  const buildSources = ['sheetonmyface', 'attachment-sheet']
    .map((id) => sourceMap.get(id))
    .filter((source): source is Source => Boolean(source))

  return (
    <aside className="meta-build-panel solved" id={`build-solved-${build.weaponId}`}>
      <div className="meta-build-title">
        <div>
          <span>{t(copy.solvedBuild, lang)}</span>
          <h3>{build.weaponName}</h3>
        </div>
      </div>
      <div className="meta-build-context">
        <span>{t(build.className, lang)}</span>
        <span>{t(build.archetype.label, lang)}</span>
        <strong>{solvedBuildPointLabel(build)}</strong>
        <strong>
          {t(copy.buildScore, lang)} {build.objectiveScore}
        </strong>
      </div>
      <p>{t(build.rationale, lang)}</p>
      <div className="meta-build-grid">
        <section className="build-section highlighted wide">
          <h3 className="build-heading">
            <span>
              {t(copy.solvedBuild, lang)} · {build.weaponName}
            </span>
            <small>{solvedBuildPointLabel(build)}</small>
          </h3>
          <div className="chips">
            {build.attachments.map((item) => (
              <SolvedAttachmentTerm key={item.id} lang={lang} value={item} />
            ))}
          </div>
        </section>
        <section className="build-section">
          <h3>{t(copy.engagement, lang)}</h3>
          <p>{t(build.archetype.label, lang)}</p>
        </section>
        <section className="build-section">
          <h3>{t(copy.tierReason, lang)}</h3>
          <p>{t(build.rationale, lang)}</p>
        </section>
      </div>
      <span className="source-label">{t(copy.dataSources, lang)}</span>
      <div className="source-row">
        {buildSources.map((source) => (
          <SourcePill key={source.id} source={source} lang={lang} />
        ))}
      </div>
    </aside>
  )
}

function MetaTierSection({ lang }: { lang: Lang }) {
  const [scenarioId, setScenarioId] = useState<MetaScenarioId>('all')
  const [weaponTypeId, setWeaponTypeId] = useState<WeaponTypeFilterId>('all')
  const [selectedBuildKey, setSelectedBuildKey] = useState(() =>
    typeof window === 'undefined' || !window.location.hash.startsWith('#build-') ? '' : window.location.hash.replace('#build-', ''),
  )
  const activeScenario = getMetaScenario(scenarioId)
  const rankedWeapons = useMemo(() => rankWeapons(metaWeapons, scenarioId), [scenarioId])
  const filteredRankedWeapons = useMemo(
    () =>
      weaponTypeId === 'all'
        ? rankedWeapons
        : rankedWeapons.filter((ranked) => weaponTypeKeyForMetric(ranked.metric) === weaponTypeId),
    [rankedWeapons, weaponTypeId],
  )
  const activeWeights = Object.entries(activeScenario.weights).filter(([, weight]) => Boolean(weight))
  const selectedBuild = selectedBuildKey.startsWith('solved-')
    ? solvedBuilds
        .map((build) => ({ key: `solved-${build.weaponId}`, kind: 'solved' as const, build }))
        .find((link) => link.key === selectedBuildKey)
    : undefined
  const fallbackBuild = filteredRankedWeapons
    .map((ranked): SolvedBuildLink | undefined => {
      const solved = solvedBuildForWeapon(ranked.metric.weapon.name.en)
      return solved ? { key: `solved-${solved.weaponId}`, kind: 'solved', build: solved } : undefined
    })
    .find((link): link is SolvedBuildLink => Boolean(link))
  const activeBuild = selectedBuild ?? fallbackBuild
  const resetSelectedBuild = () => {
    setSelectedBuildKey('')
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#build-')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }
  const selectBuild = (key: string) => {
    setSelectedBuildKey(key)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#build-${key}`)
      window.setTimeout(() => document.getElementById(`build-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    }
  }

  return (
    <section className="meta-page">
      <div className="meta-header">
        <div className="summary-label">
          <BarChart3 aria-hidden="true" />
          <span>{t(copy.metaTier, lang)}</span>
        </div>
        <h2>{t(copy.metaTierSubtitle, lang)}</h2>
        <p className="meta-scenario-copy">{t(activeScenario.description, lang)}</p>
        <div className="meta-filter-stack">
          <div className="meta-filter-group">
            <span>{t(copy.scenarioFilter, lang)}</span>
            <div className="meta-filters" aria-label={t(copy.metaFilter, lang)}>
              {metaScenarios.map((scenario) => (
                <button
                  className={scenario.id === scenarioId ? 'active' : ''}
                  key={scenario.id}
                  type="button"
                  aria-pressed={scenario.id === scenarioId}
                  onClick={() => {
                    setScenarioId(scenario.id)
                    resetSelectedBuild()
                  }}
                >
                  {t(scenario.shortLabel, lang)}
                </button>
              ))}
            </div>
          </div>
          <div className="meta-filter-group">
            <span>{t(copy.weaponTypeFilter, lang)}</span>
            <div className="meta-filters weapon-type-filters" aria-label={t(copy.weaponTypeFilter, lang)}>
              {weaponTypeOptions.map((option) => (
                <button
                  className={option.id === weaponTypeId ? 'active' : ''}
                  key={option.id}
                  type="button"
                  aria-pressed={option.id === weaponTypeId}
                  onClick={() => {
                    setWeaponTypeId(option.id)
                    resetSelectedBuild()
                  }}
                >
                  {t(option.label, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="formula-panel">
          <span>{t(copy.formulaWeights, lang)}</span>
          <div>
            {activeWeights.map(([key, weight]) => (
              <small key={key}>
                {t(rankedWeapons[0].components.find((component) => component.key === key)?.label ?? copy.metrics, lang)}{' '}
                {Math.round((weight ?? 0) * 100)}%
              </small>
            ))}
          </div>
        </div>
        <div className="data-source-panel">
          <span>{t(copy.dataPipeline, lang)}</span>
          <strong>
            {generatedWeaponStats.weapons.length} {t(copy.weaponsParsed, lang)}
          </strong>
        </div>
        <p className="meta-count">
          {filteredRankedWeapons.length} {t(copy.weaponsShown, lang)}
        </p>
      </div>
      {activeBuild ? <SolvedMetaBuildPanel build={activeBuild.build} lang={lang} /> : null}
      <div className="tier-table" role="table" aria-label={t(copy.metaTier, lang)}>
        <div className="tier-row tier-row-head" role="row">
          <span>Tier</span>
          <span>Weapon</span>
          <span>{t(copy.weaponTypeFilter, lang)}</span>
          <span>{t(copy.calculatedScore, lang)}</span>
          <span>{t(copy.ttk20, lang)}</span>
          <span>{t(copy.ttkRedsecProxy, lang)}</span>
          <span>{t(copy.roleFit, lang)}</span>
          <span>{t(copy.dataQuality, lang)}</span>
          <span>{t(copy.bestBuild, lang)}</span>
        </div>
        {filteredRankedWeapons.map((ranked) => {
          const solvedBuild = solvedBuildForWeapon(ranked.metric.weapon.name.en)

          return (
            <div
              className={`tier-row tier-${ranked.calculatedTier.replace('+', 'plus')}`}
              key={`${ranked.scenarioId}-${t(ranked.metric.weapon.name, lang)}`}
              role="row"
            >
              <span className="tier-badge">{ranked.calculatedTier}</span>
              <strong>{t(ranked.metric.weapon.name, lang)}</strong>
              <span>{t(ranked.metric.className, lang)}</span>
              <span className="score-cell">{ranked.score}</span>
              <span>{formatMs(ranked.mpTtkMs)}</span>
              <span>{formatMs(ranked.redsecTtkMs)}</span>
              <span>{ranked.roleFit}</span>
              <span>
                {ranked.dataQuality}
                <small>{t(ranked.dataQualityLabel, lang)}</small>
              </span>
              <span className="build-actions">
                {solvedBuild ? (
                  <button type="button" onClick={() => selectBuild(`solved-${solvedBuild.weaponId}`)}>
                    {t(copy.openSolvedBuild, lang)}
                  </button>
                ) : (
                  <span className="build-empty">{t(copy.buildPending, lang)}</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [selectedMode, setSelectedMode] = useState<ModeId>('quads')
  const [view, setView] = useState<ViewId>('planner')
  const plan = modePlans[selectedMode]

  return (
    <main>
      <AppHeader lang={lang} setLang={setLang} view={view} setView={setView} />
      {view === 'planner' ? (
        <>
          <ModeSelector lang={lang} selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
          <PlanSummary lang={lang} mode={selectedMode} />
          <section className="roles-band">
            {plan.roles.map((role) => (
              <RoleCard key={role.id} lang={lang} role={role} />
            ))}
          </section>
        </>
      ) : (
        <MetaTierSection lang={lang} />
      )}
    </main>
  )
}
