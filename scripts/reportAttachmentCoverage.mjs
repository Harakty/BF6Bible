import { generatedAttachmentData } from '../src/generated/attachmentData.ts'
import { attachmentSlots, inferAttachmentSlot } from '../src/buildSolver.ts'
import { layerASlots, layerBSlots } from '../src/slotAuthority.ts'

const slotTargets = {
  muzzle: 7,
  barrel: 7,
  underbarrel: 5,
  laser: 4,
  optic: 4,
  magazine: 3,
  ammo: 3,
}

const coverage = new Map(
  [...new Set([...attachmentSlots, ...layerBSlots])].map((slot) => [
    slot,
    {
      attachments: [],
      maxPointCost: 0,
      totalPointCost: 0,
    },
  ]),
)
const unknown = []
const byLayer = new Map()

for (const attachment of generatedAttachmentData.attachments) {
  const slot = attachment.slot ?? inferAttachmentSlot(attachment.name)
  if (!slot) {
    unknown.push(attachment.name)
    continue
  }

  byLayer.set(attachment.layer ?? 'unknown', (byLayer.get(attachment.layer ?? 'unknown') ?? 0) + 1)
  const bucket = coverage.get(slot)
  if (!bucket) continue
  bucket.attachments.push(attachment)
  bucket.maxPointCost = Math.max(bucket.maxPointCost, attachment.pointCost)
  bucket.totalPointCost += attachment.pointCost
}

console.log(`Attachment source: ${generatedAttachmentData.sourceUrl}`)
console.log(`Attachment source hash: ${generatedAttachmentData.sourceHash}`)
console.log(`Attachment rows: ${generatedAttachmentData.attachments.length}`)
console.log(`Layer A slots: ${layerASlots.join(', ')}`)
console.log(`Layer B slots: ${layerBSlots.join(', ')}`)
console.log(`Layers: ${[...byLayer.entries()].map(([layer, count]) => `${layer}=${count}`).join(', ')}`)
console.log('')
console.log('| Slot | Count | Target | Max point cost | Total point cost | Status |')
console.log('| --- | ---: | ---: | ---: | ---: | --- |')

for (const slot of attachmentSlots) {
  const bucket = coverage.get(slot)
  const target = slotTargets[slot] ?? 0
  const status = target === 0 || bucket.attachments.length >= target ? 'OK' : 'BELOW TARGET'
  console.log(
    `| ${slot} | ${bucket.attachments.length} | ${target} | ${bucket.maxPointCost} | ${bucket.totalPointCost} | ${status} |`,
  )
}

for (const slot of layerBSlots.filter((slot) => !attachmentSlots.includes(slot))) {
  const bucket = coverage.get(slot)
  const target = slotTargets[slot] ?? 0
  const status = target === 0 || bucket.attachments.length >= target ? 'OK' : 'BELOW TARGET'
  console.log(
    `| ${slot} | ${bucket.attachments.length} | ${target} | ${bucket.maxPointCost} | ${bucket.totalPointCost} | ${status} |`,
  )
}

if (unknown.length > 0) {
  console.log('')
  console.error(`Unknown attachment slots: ${unknown.join(', ')}`)
  process.exitCode = 1
}
