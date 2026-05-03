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
