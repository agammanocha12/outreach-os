import type { Lead, Settings } from './types'

export const SUBJECT_VARIANTS = [
  { id: 'A', text: "calls you're missing at {{business_name}}?" },
  { id: 'B', text: 'missed emergency calls at {{business_name}}?' },
  { id: 'C', text: '{{first_name}} — quick {{business_name}} question' },
]

export function extractFirstName(
  lead: Pick<Lead, 'owner_name' | 'first_name' | 'business_name'>
): string {
  if (lead.first_name) return lead.first_name
  if (lead.owner_name) return lead.owner_name.split(' ')[0]
  return 'there'
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

function trackingPixel(sendId: string): string {
  return `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/${sendId}" width="1" height="1" style="display:none" alt="" />`
}

export function buildEmail(
  lead: Lead,
  settings: Settings,
  emailNum: 1 | 2 | 3 | 4,
  sendId: string,
  variantIndex: number
): { subject: string; html: string; variantId: string } {
  const firstName = extractFirstName(lead)
  const price = settings.monthly_price ?? 400

  let subject = ''
  let bodyText = ''
  let variantId = ''

  if (emailNum === 1) {
    const variant = SUBJECT_VARIANTS[variantIndex % 3]
    variantId = variant.id
    subject = render(variant.text, { business_name: lead.business_name, first_name: firstName })

    const opener =
      lead.rating != null && lead.rating >= 4.5 && lead.review_count != null && lead.review_count >= 100
        ? `Saw ${lead.business_name} has ${lead.review_count}+ five-star reviews — clearly getting volume.\n\n`
        : ''

    const demoSection = settings.demo_link
      ? `60-second recording of it handling a real emergency call: ${settings.demo_link}\n\n`
      : ''

    bodyText = `${opener}Hey ${firstName},

Quick math for ${lead.business_name}: HVAC/plumbing shops typically miss 3-7 calls a day — while techs are on jobs, after 5pm, or during peak season. At $300-1,500 per service call, that's $1,000-7,000 a week going to whoever picks up first.

I built an AI receptionist specifically for HVAC and plumbing. Answers every call 24/7, qualifies the emergency level, books straight into your scheduler (Jobber, Housecall Pro, ServiceTitan, or Google Calendar), and texts you the details. Sounds 100% human.

$${price}/mo flat, no contract. Works on your existing number in 10 minutes.

${demoSection}Worth a quick listen?

— ${settings.full_name ?? ''}
${settings.phone ?? ''}
${settings.business_name ?? ''}
${settings.physical_address ?? ''}

Reply STOP to unsubscribe.`
  } else if (emailNum === 2) {
    subject = `re: ${lead.business_name}`
    bodyText = `Hey ${firstName} — bumping this.

Even one extra service call this week pays for the AI receptionist for 3+ months.

Worth a 60-sec listen?

— ${settings.full_name ?? ''}`
  } else if (emailNum === 3) {
    subject = `how a similar shop booked 14 extra calls last month`
    bodyText = `${firstName},

Real example — a 4-tech HVAC shop ran us for 30 days:

→ 47 calls answered after hours/weekends (all would've been missed)
→ 14 turned into booked service jobs
→ $6,200 in new revenue
→ $${price} cost = 31x return

Same setup for ${lead.business_name} this week. 10-min install on your existing number.

10-min Zoom to see it live? ${settings.booking_link ?? ''}

— ${settings.full_name ?? ''}
${settings.phone ?? ''}`
  } else {
    subject = `closing the loop on ${lead.business_name}`
    bodyText = `${firstName} — last note from me.

If timing's off, reply "ping me in 3 months" and I'll set a reminder.

Otherwise wishing ${lead.business_name} a busy season.

— ${settings.full_name ?? ''}`
  }

  const html = `<html><body><pre style="font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;max-width:600px;font-size:14px;line-height:1.6">${bodyText}</pre>${trackingPixel(sendId)}</body></html>`

  return { subject, html, variantId }
}
