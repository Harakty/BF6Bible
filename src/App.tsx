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
  copy,
  metaWeapons,
  modePlans,
  sources,
  type Lang,
  type Localized,
  type ModeId,
  type Source,
  type WeaponMetric,
} from './data'
import { getMetaScenario, metaScenarios, rankWeapons, type MetaScenarioId } from './metaEngine'
import { generatedWeaponStats } from './weaponStats'

type ViewId = 'planner' | 'meta'

const sourceMap = new Map(sources.map((source) => [source.id, source]))

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
  return value ? `${value} ms` : 'TBD'
}

function roleIcon(roleId: string) {
  if (roleId.includes('support')) return <Stethoscope aria-hidden="true" />
  if (roleId.includes('engineer')) return <Wrench aria-hidden="true" />
  if (roleId.includes('recon')) return <Radar aria-hidden="true" />
  return <Zap aria-hidden="true" />
}

function Term({ value, lang }: { value: { name: Localized }; lang: Lang }) {
  const alt = t(value.name, otherLang(lang))
  const main = t(value.name, lang)

  return (
    <span className="term">
      <span>{main}</span>
      {alt !== main ? <small>{alt}</small> : null}
    </span>
  )
}

function SourcePill({ source, lang }: { source: Source; lang: Lang }) {
  return (
    <a className={`source-pill ${source.kind}`} href={source.url} target="_blank" rel="noreferrer">
      <span>{source.label}</span>
      <small>{Math.round(source.weight * 100)}%</small>
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
          <strong>{metric.baselineStk ?? 'TBD'}</strong>
        </div>
        <div>
          <span>{t(copy.redsecScore, lang)}</span>
          <strong>{metric.redsecScore}</strong>
        </div>
      </div>
      <div className="metric-strip compact">
        <div>
          <span>{t(copy.rpm, lang)}</span>
          <strong>{metric.rpm ?? 'TBD'}</strong>
        </div>
        <div>
          <span>{t(copy.mag, lang)}</span>
          <strong>{metric.magSize ?? 'TBD'}</strong>
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
        <section>
          <h3>{t(copy.buildPrimary, lang)}</h3>
          <div className="chips">
            {activeLoadout.primary.attachments.map((item) => (
              <Term key={`${item.name.it}-${item.name.en}`} lang={lang} value={item} />
            ))}
          </div>
        </section>
        <section>
          <h3>{t(copy.buildSecondary, lang)}</h3>
          <div className="chips">
            {activeLoadout.secondary.attachments.map((item) => (
              <Term key={`${item.name.it}-${item.name.en}`} lang={lang} value={item} />
            ))}
          </div>
        </section>
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

function MetaTierSection({ lang }: { lang: Lang }) {
  const [scenarioId, setScenarioId] = useState<MetaScenarioId>('all')
  const activeScenario = getMetaScenario(scenarioId)
  const rankedWeapons = useMemo(() => rankWeapons(metaWeapons, scenarioId), [scenarioId])
  const activeWeights = Object.entries(activeScenario.weights).filter(([, weight]) => Boolean(weight))

  return (
    <section className="meta-page">
      <div className="meta-header">
        <div className="summary-label">
          <BarChart3 aria-hidden="true" />
          <span>{t(copy.metaTier, lang)}</span>
        </div>
        <h2>{t(copy.metaTierSubtitle, lang)}</h2>
        <p className="meta-scenario-copy">{t(activeScenario.description, lang)}</p>
        <div className="meta-filters" aria-label={t(copy.metaFilter, lang)}>
          {metaScenarios.map((scenario) => (
            <button
              className={scenario.id === scenarioId ? 'active' : ''}
              key={scenario.id}
              type="button"
              aria-pressed={scenario.id === scenarioId}
              onClick={() => setScenarioId(scenario.id)}
            >
              {t(scenario.shortLabel, lang)}
            </button>
          ))}
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
          {rankedWeapons.length} {t(copy.weaponsShown, lang)}
        </p>
      </div>
      <div className="tier-table" role="table" aria-label={t(copy.metaTier, lang)}>
        <div className="tier-row tier-row-head" role="row">
          <span>Tier</span>
          <span>Weapon</span>
          <span>Class</span>
          <span>{t(copy.calculatedScore, lang)}</span>
          <span>{t(copy.ttk20, lang)}</span>
          <span>{t(copy.ttkRedsecProxy, lang)}</span>
          <span>{t(copy.roleFit, lang)}</span>
          <span>{t(copy.dataQuality, lang)}</span>
        </div>
        {rankedWeapons.map((ranked) => (
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
          </div>
        ))}
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
