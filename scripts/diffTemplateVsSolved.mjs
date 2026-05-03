import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const TEMPLATE_PATH = resolve('src/generated/templateBuilds.ts')
const SOLVED_PATH = resolve('src/generated/solvedBuilds.ts')

function extractGeneratedObject(text, exportName) {
  const marker = `export const ${exportName} = `
  const start = text.indexOf(marker)
  if (start === -1) throw new Error(`Missing export ${exportName}`)
  const jsonStart = start + marker.length
  const jsonEnd = text.lastIndexOf(' as const')
  if (jsonEnd === -1 || jsonEnd <= jsonStart) throw new Error(`Cannot parse ${exportName}`)
  return JSON.parse(text.slice(jsonStart, jsonEnd))
}

function names(build) {
  return build.attachments.map((attachment) => attachment.name.en).join(' + ') || 'None'
}

function buildSignature(build) {
  const slots = ['muzzle', 'barrel', 'underbarrel', 'laser']
  const attachmentBySlot = new Map(build.attachments.map((attachment) => [attachment.slot, attachment.id]))
  return slots.map((slot) => attachmentBySlot.get(slot) ?? 'none').join('|')
}

function archetypeDiversityRows(builds) {
  const groups = new Map()

  for (const build of builds) {
    groups.set(build.archetype.id, [...(groups.get(build.archetype.id) ?? []), build])
  }

  return Array.from(groups.entries()).map(([archetype, groupedBuilds]) => {
    const distinctBuilds = new Set(groupedBuilds.map(buildSignature))
    const required = groupedBuilds.length >= 4 ? Math.max(2, Math.ceil(groupedBuilds.length / 4)) : 0

    return {
      archetype,
      weapons: groupedBuilds.length,
      distinctBuilds: distinctBuilds.size,
      required,
      status: required === 0 || distinctBuilds.size >= required ? 'OK' : 'LOW',
    }
  })
}

async function main() {
  const [templateText, solvedText] = await Promise.all([readFile(TEMPLATE_PATH, 'utf8'), readFile(SOLVED_PATH, 'utf8')])
  const templateData = extractGeneratedObject(templateText, 'generatedTemplateBuilds')
  const solvedData = extractGeneratedObject(solvedText, 'generatedSolvedBuilds')
  const templateByWeapon = new Map(templateData.builds.map((build) => [build.weaponId, build]))
  const rows = solvedData.builds.map((solved) => {
    const template = templateByWeapon.get(solved.weaponId)
    const templateNames = template ? names(template) : 'Missing'
    const solvedNames = names(solved)
    return {
      weapon: solved.weaponName,
      archetype: solved.archetype.id,
      templateNames,
      solvedNames,
      totalPoints: solved.totalPoints,
      objectiveScore: solved.objectiveScore,
      changed: templateNames === solvedNames ? 'No' : 'Yes',
    }
  })

  const changed = rows.filter((row) => row.changed === 'Yes').length
  console.log('# Template vs Solved Builds')
  console.log('')
  console.log(`${changed}/${rows.length} weapons changed attachments.`)
  console.log('')
  console.log('## Distinct Solved Builds By Archetype')
  console.log('')
  console.log('| Archetype | Weapons | Distinct builds | Required | Status |')
  console.log('| --- | ---: | ---: | ---: | --- |')

  for (const row of archetypeDiversityRows(solvedData.builds)) {
    console.log(`| ${row.archetype} | ${row.weapons} | ${row.distinctBuilds} | ${row.required || '-'} | ${row.status} |`)
  }

  console.log('')
  console.log('## Weapon Diff')
  console.log('')
  console.log('| Weapon | Archetype | Template attachments | Solved attachments | Points | Objective | Changed |')
  console.log('| --- | --- | --- | --- | ---: | ---: | --- |')

  for (const row of rows) {
    console.log(
      `| ${row.weapon} | ${row.archetype} | ${row.templateNames} | ${row.solvedNames} | ${row.totalPoints} | ${row.objectiveScore} | ${row.changed} |`,
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
