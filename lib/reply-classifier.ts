import type { ReplyCategory } from './types'

const HOT = /yes|interested|sounds good|tell me more|send info|let'?s (do|set up|talk)|book|schedule|when can/i
const WARM = /how much|price|cost|pricing|details|more info/i
const COLD = /not interested|no thanks|remove|unsubscribe|stop|don'?t (email|contact)/i
const COMPETITOR = /already (have|use|using)|we have one|we'?re set/i
const OOO = /out of office|away|vacation|on (leave|holiday)|auto.?reply/i

export function classifyReply(body: string): { category: ReplyCategory } {
  if (OOO.test(body)) return { category: 'OOO' }
  if (HOT.test(body)) return { category: 'HOT' }
  if (WARM.test(body)) return { category: 'WARM' }
  if (COLD.test(body)) return { category: 'COLD' }
  if (COMPETITOR.test(body)) return { category: 'COMPETITOR' }
  return { category: 'UNKNOWN' }
}

export function getSuggestedResponse(
  category: ReplyCategory,
  vars: {
    first_name: string
    business_name: string
    booking_link: string
    monthly_price: number
    full_name: string
  }
): string {
  switch (category) {
    case 'HOT':
      return `Awesome ${vars.first_name} — easiest is a 10-min Zoom. Tomorrow 2pm or Thursday 10am? Or grab a slot: ${vars.booking_link} — ${vars.full_name}`
    case 'WARM':
      return `$${vars.monthly_price}/mo flat, no contract, cancel anytime. 15-min demo: ${vars.booking_link} — ${vars.full_name}`
    case 'COLD':
      return `Got it ${vars.first_name}, removing you. All the best with ${vars.business_name}. — ${vars.full_name}`
    case 'COMPETITOR':
      return `Fair — which service? Always curious what's working out there. — ${vars.full_name}`
    default:
      return ''
  }
}
