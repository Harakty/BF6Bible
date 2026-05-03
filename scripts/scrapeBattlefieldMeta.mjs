import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { metaWeapons } from '../src/data.ts'

const SOURCE = 'battlefieldmeta.gg'
const BASE_URL = 'https://battlefieldmeta.gg'
const ROBOTS_URL = `${BASE_URL}/robots.txt`
const CACHE_DIR = resolve('data/cache/battlefieldmeta')
const OUTPUT_PATH = resolve('src/generated/consensusBuilds.ts')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const REQUEST_INTERVAL_MS = 1000
const SITEMAP_URLS = [
  `${BASE_URL}/sitemaps/sitemap-p1.xml`,
  `${BASE_URL}/sitemaps/sitemap-p2.xml`,
  `${BASE_URL}/sitemaps/sitemap-p3.xml`,
]

const slotTypes = [
  'Optic Accessory',
  'Left Accessory',
  'Right Accessory',
  'Top Accessory',
  'Underbarrel',
  'Ammunition',
  'Ergonomics',
  'Magazine',
  'Muzzle',
  'Barrel',
  'Scope',
]

function slugForWeapon(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '-')
    .replace(/\//g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function slugCandidates(name) {
  const base = slugForWeapon(name)
  return [
    base,
    base.replace(/300c$/, '300sc'),
    base.replace(/(\d)-(\d)/g, '$1$2'),
    base.replace(/([a-z])-([0-9])/g, '$1$2'),
    base.replace(/-/g, ''),
  ].filter((candidate, index, candidates) => candidate && candidates.indexOf(candidate) === index)
}

function urlForSlug(slug) {
  return `${BASE_URL}/best-loadouts/${slug}`
}

function cachePath(slug) {
  return resolve(CACHE_DIR, `${slug}.html`)
}

function cacheMetaPath(slug) {
  return resolve(CACHE_DIR, `${slug}.json`)
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'BF6Bible consensus scraper (+https://github.com/Harakty/BF6Bible)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
    },
  })
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`)
  return response.text()
}

async function assertRobotsAllowsLoadouts() {
  const robots = await fetchText(ROBOTS_URL)
  const disallowed = robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^disallow:/i.test(line))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
    .filter(Boolean)

  if (disallowed.some((path) => '/best-loadouts/'.startsWith(path))) {
    throw new Error(`${ROBOTS_URL} disallows /best-loadouts/`)
  }
}

async function fetchKnownLoadoutSlugs() {
  const slugs = new Set()

  for (const sitemapUrl of SITEMAP_URLS) {
    const xml = await fetchText(sitemapUrl)
    for (const match of xml.matchAll(/https:\/\/battlefieldmeta\.gg\/best-loadouts\/([^<"/]+)/g)) {
      slugs.add(match[1])
    }
    await sleep(REQUEST_INTERVAL_MS)
  }

  return slugs
}

function resolveSlug(weaponName, knownSlugs) {
  for (const candidate of slugCandidates(weaponName)) {
    if (knownSlugs.has(candidate)) return candidate
  }

  return slugForWeapon(weaponName)
}

async function readCachedHtml(slug) {
  const htmlPath = cachePath(slug)
  const metaPath = cacheMetaPath(slug)
  try {
    const [htmlStats, html, metaText] = await Promise.all([stat(htmlPath), readFile(htmlPath, 'utf8'), readFile(metaPath, 'utf8')])
    if (Date.now() - htmlStats.mtimeMs > CACHE_TTL_MS) return undefined
    const meta = JSON.parse(metaText)
    return { html, fetchTimestamp: meta.fetchTimestamp }
  } catch {
    return undefined
  }
}

async function fetchCachedHtml(slug, url) {
  const cached = await readCachedHtml(slug)
  if (cached) return cached

  const html = await fetchText(url)
  const fetchTimestamp = new Date().toISOString()
  await mkdir(CACHE_DIR, { recursive: true })
  await Promise.all([
    writeFile(cachePath(slug), html, 'utf8'),
    writeFile(cacheMetaPath(slug), JSON.stringify({ sourceUrl: url, fetchTimestamp }, null, 2), 'utf8'),
  ])
  await sleep(REQUEST_INTERVAL_MS)
  return { html, fetchTimestamp }
}

function normalizeLines(text) {
  return text
    .replace(/\u00a0/g, ' ')
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function parseAttachmentLine(text, sourceUrl, fetchTimestamp) {
  const normalized = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  for (const slotType of slotTypes) {
    const pattern = new RegExp(
      `^(.+?)\\s+${escapeRegExp(slotType)}\\s+(\\d+)(?:\\s+Level\\s+(\\d+)|\\s+SEASON\\s+\\d+\\s+HARDWARE\\s+(\\d+))?$`,
      'i',
    )
    const match = normalized.match(pattern)
    if (!match) continue

    return {
      name: match[1].trim(),
      slotType,
      pointCost: Number(match[2]),
      unlockLevel: match[3] === undefined && match[4] === undefined ? 0 : Number(match[3] ?? match[4]),
      sourceUrl,
      fetchTimestamp,
    }
  }

  return undefined
}

function parseConsensusHtml(html, weaponName, sourceUrl, fetchTimestamp) {
  const $ = cheerio.load(html)
  const bodyText = $('body').text().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')
  const budgetVariants = parseBudgetVariants($, sourceUrl, fetchTimestamp)
  if (budgetVariants.length === 0) {
    throw new Error(`${weaponName}: budget-text parse failed from ${sourceUrl}`)
  }

  const recommendedVariant =
    budgetVariants.find((variant) => variant.label.toLowerCase() === 'recommended') ?? budgetVariants[0]
  const attachments = recommendedVariant.attachments
  const consensusSpent = recommendedVariant.spent
  const sourceDisplayedMaxBudget = recommendedVariant.displayedMaxBudget
  const weaponMaxBudget = inferWeaponMaxBudget(budgetVariants)

  const tier = bodyText.match(/Ranking of the .*? Tier\s+(META|A|B|C|D)(?:\s+Tier)?\s+Ranking/)?.[1]
  const rankingMatch = bodyText.match(/Ranking of the .*? Tier\s+(?:META|A|B|C|D)(?:\s+Tier)?\s+Ranking\s+#(\d+)\s*([A-Za-z ]+?)\s+Unlock level/)
  const totalPoints = attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)

  if (attachments.length === 0) {
    throw new Error(`${weaponName}: no recommended attachments parsed from ${sourceUrl}`)
  }
  if (!tier || !['META', 'A', 'B', 'C', 'D'].includes(tier)) {
    throw new Error(`${weaponName}: tier parse failed from ${sourceUrl}`)
  }
  if (!rankingMatch) {
    throw new Error(`${weaponName}: category rank parse failed from ${sourceUrl}`)
  }
  if (totalPoints !== consensusSpent) {
    throw new Error(`${weaponName}: parsed ${totalPoints} points but source declares ${consensusSpent}/${sourceDisplayedMaxBudget}`)
  }
  if (consensusSpent > weaponMaxBudget) {
    throw new Error(`${weaponName}: consensusSpent ${consensusSpent} exceeds weaponMaxBudget ${weaponMaxBudget}`)
  }

  return {
    sourceUrl,
    fetchTimestamp,
    tier,
    categoryRank: {
      position: Number(rankingMatch[1]),
      category: rankingMatch[2],
    },
    attachments,
    consensusSpent,
    weaponMaxBudget,
    sourceDisplayedMaxBudget,
    budgetVariants: budgetVariants.map(({ attachments: _attachments, ...variant }) => variant),
  }
}

function parseBudgetVariants($, sourceUrl, fetchTimestamp) {
  return $('.playstyle-card')
    .toArray()
    .map((card, index) => {
      const budgetText = $(card).find('.budget-text').first().text().replace(/\s+/g, '').trim()
      const budgetMatch = budgetText.match(/^(\d+)\/(\d+)$/)
      if (!budgetMatch) return undefined

      const cardText = $(card).text().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
      const label = cardText.slice(0, cardText.indexOf(budgetText)).trim() || `Build ${index + 1}`
      const attachments = $(card)
        .find('li')
        .toArray()
        .map((element) => parseAttachmentLine($(element).text(), sourceUrl, fetchTimestamp))
        .filter(Boolean)

      return {
        label,
        spent: Number(budgetMatch[1]),
        displayedMaxBudget: Number(budgetMatch[2]),
        attachmentTotal: attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0),
        attachments,
      }
    })
    .filter(Boolean)
}

function inferWeaponMaxBudget(variants) {
  const spentValues = variants.map((variant) => variant.spent)
  const displayedValues = variants.map((variant) => variant.displayedMaxBudget)
  const maxDisplayed = Math.max(...displayedValues)
  const maxSpent = Math.max(...spentValues)
  const allSpentSame = spentValues.every((value) => value === spentValues[0])
  const allDisplayedSame = displayedValues.every((value) => value === displayedValues[0])

  // Some pages show a generic 100 display while every published variant reaches only 95.
  // When all observed variants plateau at the same lower spend, treat that plateau as the real combinatorial cap.
  if (variants.length > 1 && allSpentSame && allDisplayedSame && maxSpent < maxDisplayed) {
    return maxSpent
  }

  return maxDisplayed
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stableStringify(value) {
  return JSON.stringify(value, null, 2)
}

async function main() {
  await assertRobotsAllowsLoadouts()
  const knownSlugs = await fetchKnownLoadoutSlugs()

  const builds = {}
  const failures = []

  for (const weapon of metaWeapons) {
    const weaponName = weapon.weapon.name.en
    const slug = resolveSlug(weaponName, knownSlugs)
    const sourceUrl = urlForSlug(slug)
    try {
      const { html, fetchTimestamp } = await fetchCachedHtml(slug, sourceUrl)
      builds[weaponName] = parseConsensusHtml(html, weaponName, sourceUrl, fetchTimestamp)
      console.log(
        `${weaponName}: consensus ${builds[weaponName].consensusSpent}/${builds[weaponName].sourceDisplayedMaxBudget}, cap ${builds[weaponName].weaponMaxBudget} ${builds[weaponName].tier}`,
      )
    } catch (error) {
      failures.push({ weaponName, sourceUrl, error: error instanceof Error ? error.message : String(error) })
      console.error(`${weaponName}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (failures.length > 0) {
    console.error('')
    console.error('Consensus scrape failed:')
    for (const failure of failures) {
      console.error(`- ${failure.weaponName}: ${failure.sourceUrl}: ${failure.error}`)
    }
    process.exitCode = 1
    return
  }

  const fetchTimestamps = Object.values(builds).map((build) => build.fetchTimestamp)
  const dataset = {
    schemaVersion: 2,
    source: SOURCE,
    fetchedAt: fetchTimestamps.sort().at(-1),
    cacheTtlDays: 7,
    builds,
  }

  const file = `// Generated by scripts/scrapeBattlefieldMeta.mjs. Do not edit by hand.\nexport const consensusBuilds = ${stableStringify(dataset)} as const\n`
  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, file, 'utf8')
  console.log('')
  console.log(`Generated ${Object.keys(builds).length} consensus builds.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
