import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import * as cheerio from 'cheerio'
import { metaWeapons } from '../src/data.ts'

const SOURCE = 'battlefieldmeta.gg'
const BASE_URL = 'https://battlefieldmeta.gg'
const ROBOTS_URL = `${BASE_URL}/robots.txt`
const CACHE_DIR = resolve('data/cache/battlefieldmeta')
const WEAPON_IMAGE_DIR = resolve('public/weapons')
const OUTPUT_PATH = resolve('src/generated/consensusBuilds.ts')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const REQUEST_INTERVAL_MS = 1000
const IMAGE_REQUEST_INTERVAL_MS = 500
const SITEMAP_URLS = [
  `${BASE_URL}/sitemaps/sitemap-p1.xml`,
  `${BASE_URL}/sitemaps/sitemap-p2.xml`,
  `${BASE_URL}/sitemaps/sitemap-p3.xml`,
]
const CATEGORY_RANKING_PAGES = [
  { slug: 'best-assault-rifles-in-battlefield', url: `${BASE_URL}/best-guns/best-assault-rifles-in-battlefield` },
  { slug: 'best-carbines-in-battlefield', url: `${BASE_URL}/best-guns/best-carbines-in-battlefield` },
  { slug: 'best-smg-in-battlefield', url: `${BASE_URL}/best-guns/best-smg-in-battlefield` },
  { slug: 'best-lmg-in-battlefield', url: `${BASE_URL}/best-guns/best-lmg-in-battlefield` },
  { slug: 'best-dmr-in-battlefield', url: `${BASE_URL}/best-guns/best-dmr-in-battlefield` },
  { slug: 'best-sniper-rifles-in-battlefield', url: `${BASE_URL}/best-guns/best-sniper-rifles-in-battlefield` },
  { slug: 'best-shotguns-in-battlefield', url: `${BASE_URL}/best-guns/best-shotguns-in-battlefield` },
  { slug: 'best-secondaries-in-battlefield', url: `${BASE_URL}/best-guns/best-secondaries-in-battlefield` },
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

const variantUiLabels = {
  Recommended: { variantId: 'recommended', variantLabel: { it: 'Consigliata', en: 'Recommended' } },
  'Lowest Recoil': { variantId: 'lowest-recoil', variantLabel: { it: 'Rinculo minimo', en: 'Lowest Recoil' } },
  'Fastest ADS': { variantId: 'fastest-ads', variantLabel: { it: 'ADS rapido', en: 'Fastest ADS' } },
  'Hip Fire': { variantId: 'hip-fire', variantLabel: { it: 'Hip fire', en: 'Hip Fire' } },
}

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

async function fetchBytes(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'BF6Bible consensus scraper (+https://github.com/Harakty/BF6Bible)',
      accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
    },
  })
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`)
  return Buffer.from(await response.arrayBuffer())
}

async function assertRobotsAllowsLoadouts() {
  const robots = await fetchText(ROBOTS_URL)
  const disallowed = robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^disallow:/i.test(line))
    .map((line) => line.slice(line.indexOf(':') + 1).trim())
    .filter(Boolean)

  const requiredPaths = ['/best-loadouts/', '/best-guns/']
  if (disallowed.some((path) => requiredPaths.some((requiredPath) => requiredPath.startsWith(path)))) {
    throw new Error(`${ROBOTS_URL} disallows ${requiredPaths.join(' or ')}`)
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

  const variants = buildVariants(weaponName, budgetVariants)
  const recommendedVariant = variants.Recommended
  if (!recommendedVariant) {
    throw new Error(`${weaponName}: Recommended variant missing from ${sourceUrl}`)
  }
  const weaponMaxBudget = inferWeaponMaxBudget(budgetVariants)

  const tier = bodyText.match(/Ranking of the .*? Tier\s+(META|A|B|C|D)(?:\s+Tier)?\s+Ranking/)?.[1]
  const rankingMatch = bodyText.match(/Ranking of the .*? Tier\s+(?:META|A|B|C|D)(?:\s+Tier)?\s+Ranking\s+#(\d+)\s*([A-Za-z ]+?)\s+Unlock level/)

  if (recommendedVariant.attachments.length === 0) {
    throw new Error(`${weaponName}: no recommended attachments parsed from ${sourceUrl}`)
  }
  if (!tier || !['META', 'A', 'B', 'C', 'D'].includes(tier)) {
    throw new Error(`${weaponName}: tier parse failed from ${sourceUrl}`)
  }
  if (!rankingMatch) {
    throw new Error(`${weaponName}: category rank parse failed from ${sourceUrl}`)
  }
  if (recommendedVariant.totalPoints > weaponMaxBudget) {
    throw new Error(`${weaponName}: Recommended total ${recommendedVariant.totalPoints} exceeds weaponMaxBudget ${weaponMaxBudget}`)
  }

  return {
    sourceUrl,
    fetchTimestamp,
    tier,
    categoryRank: {
      position: Number(rankingMatch[1]),
      category: rankingMatch[2],
    },
    weaponMaxBudget,
    variants,
  }
}

function parseWeaponImageUrl(html, slug) {
  const escapedSlug = escapeRegExp(slug)
  const displayMatch = html.match(
    new RegExp(
      `<img[^>]+src=["'](https://img\\.battlefieldmeta\\.gg/${escapedSlug}(?:_version\\d+)?/gunDisplayLoadouts)["']`,
      'i',
    ),
  )
  if (displayMatch) return displayMatch[1]

  const fullMatch = html.match(
    new RegExp(
      `<img[^>]+src=["'](https://img\\.battlefieldmeta\\.gg/${escapedSlug}(?:_version\\d+)?/gunFullDisplay)["']`,
      'i',
    ),
  )
  return fullMatch?.[1]?.replace(/\/gunFullDisplay$/, '/gunDisplayLoadouts')
}

function parseCategoryRankingHtml(html, sourceUrl, fetchTimestamp) {
  const $ = cheerio.load(html)
  const stateText = $('#ng-state').text()
  if (!stateText) throw new Error(`${sourceUrl}: missing ng-state ranking data`)

  const state = JSON.parse(stateText)
  const entries = []
  for (const value of Object.values(state)) {
    const data = value?.b?.data ?? value?.b?.success?.data ?? value?.data
    const tierList = data?.tierList
    const rankingsByTier = data?.rankings ?? tierList?.rankings
    if (!tierList || !rankingsByTier) continue

    for (const [tierName, tierEntries] of Object.entries(rankingsByTier)) {
      for (const entry of tierEntries ?? []) {
        const weapon = entry?.weapon
        if (!weapon?.id || !weapon?.name) continue
        const rankings = weapon.rankings ?? {}
        const tier = rankings.tier ?? tierName
        const weaponGroupRank = rankings.weaponGroup?.position
          ? { position: Number(rankings.weaponGroup.position), category: weapon.weaponGroup?.name ?? 'Weapon Group' }
          : undefined
        const weaponTypeRank = rankings.weaponType?.position
          ? { position: Number(rankings.weaponType.position), category: weapon.weaponType?.name ?? 'Weapon Type' }
          : undefined

        entries.push({
          weaponId: weapon.id,
          weaponName: weapon.name,
          tier,
          categoryRank: weaponGroupRank ?? weaponTypeRank,
          weaponGroupRank,
          weaponTypeRank,
          sourceUrl,
          fetchTimestamp,
        })
      }
    }
  }

  if (entries.length === 0) throw new Error(`${sourceUrl}: no category rankings parsed`)

  return entries
}

function buildVariants(weaponName, budgetVariants) {
  const variants = {}

  for (const budgetVariant of budgetVariants) {
    const label = normalizeVariantLabel(budgetVariant.label)
    if (variants[label]) {
      throw new Error(`${weaponName}: duplicate variant label "${label}"`)
    }
    if (budgetVariant.attachments.length === 0) {
      throw new Error(`${weaponName} ${label}: no attachments parsed`)
    }
    if (budgetVariant.attachmentTotal !== budgetVariant.spent) {
      throw new Error(
        `${weaponName} ${label}: parsed ${budgetVariant.attachmentTotal} points but source declares ${budgetVariant.spent}/${budgetVariant.displayedMaxBudget}`,
      )
    }

    const ui = variantUiLabels[label] ?? {
      variantId: variantIdForLabel(label),
      variantLabel: { it: label, en: label },
    }

    variants[label] = {
      variantId: ui.variantId,
      variantLabel: ui.variantLabel,
      attachments: budgetVariant.attachments,
      totalPoints: budgetVariant.spent,
      sourceDisplayedMaxBudget: budgetVariant.displayedMaxBudget,
    }
  }

  return variants
}

function normalizeVariantLabel(label) {
  const normalized = label.replace(/\s+/g, ' ').trim()
  const known = Object.keys(variantUiLabels).find((variantLabel) => variantLabel.toLowerCase() === normalized.toLowerCase())
  return known ?? normalized
}

function variantIdForLabel(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

async function fileExists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function slugFromSourceUrl(sourceUrl) {
  return sourceUrl.split('/').filter(Boolean).at(-1)
}

function normalizeWeaponName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

async function persistWeaponImages(builds) {
  await mkdir(WEAPON_IMAGE_DIR, { recursive: true })

  for (const [weaponName, build] of Object.entries(builds)) {
    if (!build.imageUrl) continue

    const slug = slugFromSourceUrl(build.sourceUrl) ?? slugForWeapon(weaponName)
    const relativePath = `/weapons/${slug}.webp`
    const targetPath = resolve(WEAPON_IMAGE_DIR, `${slug}.webp`)

    if (await fileExists(targetPath)) {
      build.imagePath = relativePath
      continue
    }

    try {
      const buffer = await fetchBytes(build.imageUrl)
      await writeFile(targetPath, buffer)
      build.imagePath = relativePath
      console.log(`[scraper] saved image for ${weaponName} -> ${relativePath} (${buffer.length} bytes)`)
      await sleep(IMAGE_REQUEST_INTERVAL_MS)
    } catch (error) {
      delete build.imageUrl
      console.warn(`[scraper] image download failed for ${weaponName}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

async function fetchCategoryRankings() {
  const rankings = new Map()
  const failures = []

  for (const page of CATEGORY_RANKING_PAGES) {
    const cacheSlug = `ranking-${page.slug}`
    try {
      const { html, fetchTimestamp } = await fetchCachedHtml(cacheSlug, page.url)
      const pageRankings = parseCategoryRankingHtml(html, page.url, fetchTimestamp)
      for (const ranking of pageRankings) {
        rankings.set(normalizeWeaponName(ranking.weaponId), ranking)
        rankings.set(normalizeWeaponName(ranking.weaponName), ranking)
      }
      console.log(`[scraper] ${page.slug}: ${pageRankings.length} category rankings`)
    } catch (error) {
      failures.push({ sourceUrl: page.url, error: error instanceof Error ? error.message : String(error) })
      console.error(`${page.url}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (failures.length > 0) {
    const details = failures.map((failure) => `- ${failure.sourceUrl}: ${failure.error}`).join('\n')
    throw new Error(`Category ranking scrape failed:\n${details}`)
  }

  return rankings
}

function applyCategoryRankings(builds, categoryRankings) {
  const unmatched = []

  for (const [weaponName, build] of Object.entries(builds)) {
    const sourceSlug = slugFromSourceUrl(build.sourceUrl)
    const ranking =
      categoryRankings.get(normalizeWeaponName(weaponName)) ??
      (sourceSlug ? categoryRankings.get(normalizeWeaponName(sourceSlug)) : undefined)

    if (!ranking?.categoryRank) {
      unmatched.push(weaponName)
      continue
    }

    build.loadoutTier = build.tier
    build.loadoutCategoryRank = build.categoryRank
    build.tier = ranking.tier
    build.categoryRank = ranking.categoryRank
    build.rankingSourceUrl = ranking.sourceUrl
    build.rankingFetchTimestamp = ranking.fetchTimestamp
    build.rankingConsensus = {
      weaponId: ranking.weaponId,
      weaponName: ranking.weaponName,
      tier: ranking.tier,
      categoryRank: ranking.categoryRank,
      weaponGroupRank: ranking.weaponGroupRank,
      weaponTypeRank: ranking.weaponTypeRank,
      sourceUrl: ranking.sourceUrl,
      fetchTimestamp: ranking.fetchTimestamp,
    }
  }

  if (unmatched.length > 0) {
    throw new Error(`Missing category ranking consensus for ${unmatched.length} weapons: ${unmatched.join(', ')}`)
  }
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
      const imageUrl = parseWeaponImageUrl(html, slug)
      if (imageUrl) builds[weaponName].imageUrl = imageUrl
      const recommended = builds[weaponName].variants.Recommended
      console.log(
        `${weaponName}: consensus ${recommended.totalPoints}/${recommended.sourceDisplayedMaxBudget}, cap ${builds[weaponName].weaponMaxBudget} ${builds[weaponName].tier}, variants ${Object.keys(builds[weaponName].variants).length}`,
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

  const categoryRankings = await fetchCategoryRankings()
  applyCategoryRankings(builds, categoryRankings)
  await persistWeaponImages(builds)

  const fetchTimestamps = Object.values(builds).map((build) => build.fetchTimestamp)
  const dataset = {
    schemaVersion: 3,
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
