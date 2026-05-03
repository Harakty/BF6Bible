import { metaWeapons } from '../src/data.ts'
import { consensusBuilds } from '../src/generated/consensusBuilds.ts'

const weaponNames = metaWeapons.map((weapon) => weapon.weapon.name.en)
const missing = weaponNames.filter((name) => !consensusBuilds.builds[name])
const covered = weaponNames.length - missing.length
const slotCounts = new Map()
const capByCategory = new Map()
const underSpent = []
const nonUniformDisplayedCaps = []
let atWeaponCap = 0
let matchingConsensusSpent = 0

for (const weapon of metaWeapons) {
  const name = weapon.weapon.name.en
  const build = consensusBuilds.builds[name]
  if (!build) continue

  const total = build.attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)
  if (total === build.weaponMaxBudget) atWeaponCap += 1
  if (total === build.consensusSpent) matchingConsensusSpent += 1
  if (build.consensusSpent < build.weaponMaxBudget) {
    underSpent.push({
      name,
      spent: build.consensusSpent,
      cap: build.weaponMaxBudget,
      gap: build.weaponMaxBudget - build.consensusSpent,
    })
  }

  const displayedCaps = [...new Set(build.budgetVariants.map((variant) => variant.displayedMaxBudget))]
  if (displayedCaps.length > 1) {
    nonUniformDisplayedCaps.push({ name, displayedCaps })
  }

  const category = weapon.className.en
  const categoryCaps = capByCategory.get(category) ?? new Map()
  const capNames = categoryCaps.get(build.weaponMaxBudget) ?? []
  capNames.push(name)
  categoryCaps.set(build.weaponMaxBudget, capNames)
  capByCategory.set(category, categoryCaps)

  for (const attachment of build.attachments) {
    slotCounts.set(attachment.slotType, (slotCounts.get(attachment.slotType) ?? 0) + 1)
  }
}

console.log(`Weapons covered: ${covered}/${weaponNames.length}`)
console.log(`Missing: ${missing.length}`)
if (missing.length > 0) {
  console.log(`Missing weapons: ${missing.join(', ')}`)
}
console.log(`Consensus builds at weapon cap: ${atWeaponCap}/${covered}`)
console.log(`Builds matching consensusSpent: ${matchingConsensusSpent}/${covered}`)
console.log('')
console.log('Cap distribution by category:')
for (const [category, caps] of [...capByCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const summary = [...caps.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cap, names]) => `${cap} (x${names.length}${names.length <= 3 ? `: ${names.join(', ')}` : ''})`)
    .join(', ')
  console.log(`- ${category}: ${summary}`)
}
console.log('')
console.log('Under-spent by consensus:')
if (underSpent.length === 0) {
  console.log('- none')
} else {
  for (const item of underSpent.sort((a, b) => b.gap - a.gap || a.name.localeCompare(b.name))) {
    console.log(`- ${item.name}: ${item.spent}/${item.cap} (gap ${item.gap})`)
  }
}
console.log('')
console.log('Non-uniform displayed caps across variants:')
if (nonUniformDisplayedCaps.length === 0) {
  console.log('- none')
} else {
  for (const item of nonUniformDisplayedCaps) {
    console.log(`- ${item.name}: ${item.displayedCaps.join(', ')}`)
  }
}
console.log('')
console.log('| Weapon | Consensus spent | Weapon cap | Displayed source cap | Tier | Category rank | Source |')
console.log('| --- | ---: | ---: | ---: | --- | --- | --- |')
for (const name of weaponNames) {
  const build = consensusBuilds.builds[name]
  if (!build) continue
  const total = build.attachments.reduce((sum, attachment) => sum + attachment.pointCost, 0)
  console.log(
    `| ${name} | ${total} | ${build.weaponMaxBudget} | ${build.sourceDisplayedMaxBudget} | ${build.tier} | #${build.categoryRank.position} ${build.categoryRank.category} | ${build.sourceUrl} |`,
  )
}
console.log('')
console.log('Slot types observed:')
for (const [slot, count] of [...slotCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`- ${slot}: ${count}`)
}
