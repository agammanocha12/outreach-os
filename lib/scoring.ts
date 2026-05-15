import type { Lead } from './types'

export function scoreLead(lead: Partial<Lead>): number {
  let score = 50
  if (lead.rating && lead.rating >= 4.5) score += 20
  if (lead.review_count && lead.review_count >= 50) score += 15
  if (lead.review_count && lead.review_count >= 200) score += 25
  if (lead.website) score += 10
  if (lead.email && !lead.email.match(/^(info|contact|hello|admin|support|office)@/i)) score += 20
  if (lead.website && /24[/\-\s]?7|emergency|after.?hours/i.test(lead.website)) score += 15
  if (lead.website && /(answering|receptionist|virtual.?assistant)/i.test(lead.website)) score -= 30
  return Math.max(0, Math.min(100, score))
}
