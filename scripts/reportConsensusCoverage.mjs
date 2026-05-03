import { metaWeapons } from '../src/data.ts'
import { consensusBuilds } from '../src/generated/consensusBuilds.ts'

const weaponNames = metaWeapons.map((weapon) => weapon.weapon.name.en)
const missing = weaponNames.filter((name) => !consensusBuilds.builds[name])
const covered = weaponNames.length - missing.length
const slotCounts = new Map()
let atFullBudget = 0
let matchingDeclaredBudget = 0

for (const name of weaponNames) {
  const build = consensusBuilds.builds[name]
  if (!build) continue

  const total = build.attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)
  if (total === 100 && build.budgetCap === 100) atFullBudget += 1
  if (total === build.totalPoints) matchingDeclaredBudget += 1

  for (const attachment of build.attachments) {
    slotCounts.set(attachment.slotType, (slotCounts.get(attachment.slotType) ?? 0) + 1)
  }
}

console.log(`Weapons covered: ${covered}/${weaponNames.length}`)
console.log(`Missing: ${missing.length}`)
if (missing.length > 0) {
  console.log(`Missing weapons: ${missing.join(', ')}`)
}
console.log(`Builds at 100/100: ${atFullBudget}/${covered}`)
console.log(`Builds matching parsed source total: ${matchingDeclaredBudget}/${covered}`)
console.log('')
console.log('| Weapon | Source budget | Tier | Category rank | Source |')
console.log('| --- | ---: | --- | --- | --- |')
for (const name of weaponNames) {
  const build = consensusBuilds.builds[name]
  if (!build) continue
  const total = build.attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)
  console.log(`| ${name} | ${total}/${build.budgetCap} | ${build.tier} | #${build.categoryRank.position} ${build.categoryRank.category} | ${build.sourceUrl} |`)
}
console.log('')
console.log('Slot types observed:')
for (const [slot, count] of [...slotCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`- ${slot}: ${count}`)
}
