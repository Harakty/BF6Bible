import {
  Activity,
  BarChart3,
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

const sourceMap = new Map(sources.map((source) => [source.id, source]))

function t(value: Localized, lang: Lang) {
  return value[lang]
}

function otherLang(lang: Lang): Lang {
  return lang === 'it' ? 'en' : 'it'
}

function roleIcon(roleId: string) {
  if (roleId.includes('support')) return <Stethoscope aria-hidden="true" />
  if (roleId.includes('engineer')) return <Wrench aria-hidden="true" />
  if (roleId.includes('recon')) return <Radar aria-hidden="true" />
  return <Zap aria-hidden="true" />
}

function confidenceLabel(score: number, lang: Lang) {
  if (score >= 0.8) return lang === 'it' ? 'Alta' : 'High'
  if (score >= 0.7) return lang === 'it' ? 'Media-alta' : 'Medium-high'
  return lang === 'it' ? 'Media' : 'Medium'
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

function MiniMap({ mode }: { mode: ModeId }) {
  const points =
    mode === 'quads'
      ? [
          ['entry', 64, 44],
          ['medic', 47, 60],
          ['av', 30, 47],
          ['info', 74, 24],
        ]
      : [
          ['medic', 45, 55],
          ['flex', 62, 39],
        ]

  return (
    <div className="tactical-map" aria-hidden="true">
      <div className="route primary-route" />
      <div className="route flank-route" />
      <div className="zone zone-a" />
      <div className="zone zone-b" />
      {points.map(([name, left, top]) => (
        <span
          className={`map-point ${name}`}
          key={name}
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      ))}
    </div>
  )
}

function AppHeader({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Shield aria-hidden="true" />
        <div>
          <strong>{t(copy.appName, lang)}</strong>
          <span>{t(copy.dataStatus, lang)}</span>
        </div>
      </div>
      <button
        className="language-toggle"
        type="button"
        onClick={() => setLang(lang === 'it' ? 'en' : 'it')}
        aria-label="Toggle language"
      >
        <Languages aria-hidden="true" />
        <span>{lang === 'it' ? 'IT' : 'EN'}</span>
      </button>
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
          <strong>{metric.baselineTtkMs ? `${metric.baselineTtkMs} ms` : 'TBD'}</strong>
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
        <div>
          <span>{t(copy.sourceConfidence, lang)}</span>
          <strong>{confidenceLabel(metric.confidence, lang)}</strong>
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

  const averageConfidence = useMemo(() => {
    const values = plan.roles.flatMap((role) => role.loadouts.map((loadout) => loadout.confidence))
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }, [plan])

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
            <span>{t(copy.sourceConfidence, lang)}</span>
            <strong>{Math.round(averageConfidence * 100)}%</strong>
          </div>
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
      <MiniMap mode={mode} />
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
  return (
    <section className="meta-band">
      <div className="meta-header">
        <div className="summary-label">
          <BarChart3 aria-hidden="true" />
          <span>{t(copy.metaTier, lang)}</span>
        </div>
        <h2>{t(copy.metaTierSubtitle, lang)}</h2>
      </div>
      <div className="tier-table" role="table" aria-label={t(copy.metaTier, lang)}>
        <div className="tier-row tier-row-head" role="row">
          <span>Tier</span>
          <span>Weapon</span>
          <span>Class</span>
          <span>{t(copy.ttk, lang)}</span>
          <span>{t(copy.stk, lang)}</span>
          <span>{t(copy.mag, lang)}</span>
          <span>{t(copy.redsecScore, lang)}</span>
          <span>{t(copy.tierReason, lang)}</span>
        </div>
        {metaWeapons.map((metric) => (
          <div className={`tier-row tier-${metric.tier.replace('+', 'plus')}`} key={t(metric.weapon.name, lang)} role="row">
            <span className="tier-badge">{metric.tier}</span>
            <strong>{t(metric.weapon.name, lang)}</strong>
            <span>{t(metric.className, lang)}</span>
            <span>{metric.baselineTtkMs ? `${metric.baselineTtkMs} ms` : 'TBD'}</span>
            <span>{metric.baselineStk ?? 'TBD'}</span>
            <span>{metric.magSize ?? 'TBD'}</span>
            <span>{metric.redsecScore}</span>
            <p>{t(metric.tierReason, lang)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [selectedMode, setSelectedMode] = useState<ModeId>('quads')
  const plan = modePlans[selectedMode]

  return (
    <main>
      <AppHeader lang={lang} setLang={setLang} />
      <ModeSelector lang={lang} selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
      <PlanSummary lang={lang} mode={selectedMode} />
      <section className="roles-band">
        {plan.roles.map((role) => (
          <RoleCard key={role.id} lang={lang} role={role} />
        ))}
      </section>
      <MetaTierSection lang={lang} />
    </main>
  )
}
