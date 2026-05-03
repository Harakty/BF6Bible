import { generatedAttachmentData } from '../src/generated/attachmentData.ts'
import { attachmentSlots, inferAttachmentSlot } from '../src/buildSolver.ts'

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
  attachmentSlots.map((slot) => [
    slot,
    {
      attachments: [],
      maxPointCost: 0,
      totalPointCost: 0,
    },
  ]),
)
const unknown = []

for (const attachment of generatedAttachmentData.attachments) {
  const slot = inferAttachmentSlot(attachment.name)
  if (!slot) {
    unknown.push(attachment.name)
    continue
  }

  const bucket = coverage.get(slot)
  bucket.attachments.push(attachment)
  bucket.maxPointCost = Math.max(bucket.maxPointCost, attachment.pointCost)
  bucket.totalPointCost += attachment.pointCost
}

console.log(`Attachment source: ${generatedAttachmentData.sourceUrl}`)
console.log(`Attachment source hash: ${generatedAttachmentData.sourceHash}`)
console.log(`Attachment rows: ${generatedAttachmentData.attachments.length}`)
console.log('')
console.log('| Slot | Count | Target | Max point cost | Total point cost | Status |')
console.log('| --- | ---: | ---: | ---: | ---: | --- |')

for (const slot of attachmentSlots) {
  const bucket = coverage.get(slot)
  const target = slotTargets[slot]
  const status = bucket.attachments.length >= target ? 'OK' : 'BELOW TARGET'
  console.log(
    `| ${slot} | ${bucket.attachments.length} | ${target} | ${bucket.maxPointCost} | ${bucket.totalPointCost} | ${status} |`,
  )
}

if (unknown.length > 0) {
  console.log('')
  console.error(`Unknown attachment slots: ${unknown.join(', ')}`)
  process.exitCode = 1
}
