import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false } }
)

const JUNK_EMAIL_PATTERNS = [
  /example\.com/i,
  /godaddy/i,
  /wixpress/i,
  /sentry/i,
  /no-?reply/i,
  /donotreply/i,
  /\.(png|jpg|gif|svg)/i,
  /localhost/i,
]

function isJunkEmail(email: string): boolean {
  return JUNK_EMAIL_PATTERNS.some(p => p.test(email))
}

function scoreLead(lead: {
  rating?: number | null
  review_count?: number | null
  website?: string | null
  email?: string | null
}): number {
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

async function findEmailsOnPage(url: string): Promise<string[]> {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage()
  const emails = new Set<string>()

  try {
    await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' })

    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

    const pageText = await page.evaluate(() => document.body.innerText)
    const matches = pageText.match(emailRegex) ?? []
    for (const e of matches) {
      if (!isJunkEmail(e)) emails.add(e.toLowerCase())
    }

    const hrefs = await page.$$eval('a[href^="mailto:"]', links =>
      links.map(l => (l as HTMLAnchorElement).href.replace('mailto:', '').split('?')[0])
    )
    for (const e of hrefs) {
      if (!isJunkEmail(e)) emails.add(e.toLowerCase())
    }

    if (emails.size === 0) {
      try {
        const contactUrl = new URL('/contact', url).href
        await page.goto(contactUrl, { timeout: 10000, waitUntil: 'domcontentloaded' })
        const contactText = await page.evaluate(() => document.body.innerText)
        const contactMatches = contactText.match(emailRegex) ?? []
        for (const e of contactMatches) {
          if (!isJunkEmail(e)) emails.add(e.toLowerCase())
        }
        const contactHrefs = await page.$$eval('a[href^="mailto:"]', links =>
          links.map(l => (l as HTMLAnchorElement).href.replace('mailto:', '').split('?')[0])
        )
        for (const e of contactHrefs) {
          if (!isJunkEmail(e)) emails.add(e.toLowerCase())
        }
      } catch {}
    }
  } catch (err) {
    console.error(`  Email fetch failed for ${url}:`, (err as Error).message)
  } finally {
    await browser.close()
  }

  return Array.from(emails)
}

interface Lead {
  business_name: string
  phone?: string
  website?: string
  rating?: number
  review_count?: number
  city: string
  niche: string
  email?: string
  score: number
}

async function scrapeCity(niche: string, city: string, maxCount: number): Promise<Lead[]> {
  const query = `${niche} in ${city}`
  console.log(`\nScraping: "${query}"`)

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage()
  const leads: Lead[] = []

  try {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`
    await page.goto(url, { timeout: 45000, waitUntil: 'load' })
    await page.waitForTimeout(4000)

    const resultsPanel = page.locator('[role="feed"]')

    for (let scroll = 0; scroll < 8; scroll++) {
      await resultsPanel.evaluate(el => el.scrollBy(0, 1000))
      await page.waitForTimeout(1500)

      const endMarker = await page.$('span:has-text("You\'ve reached the end")')
      if (endMarker) break

      const items = await page.$$('[role="article"]')
      if (items.length >= maxCount) break
    }

    const items = await page.$$('[role="article"]')
    console.log(`  Found ${items.length} results`)

    for (const item of items.slice(0, maxCount)) {
      try {
        const name = await item.$eval(
          '.qBF1Pd, [jstcache="3"] .fontHeadlineSmall',
          el => el.textContent?.trim() ?? ''
        ).catch(() => '')

        if (!name) continue

        const ratingEl = await item.$('.MW4etd')
        const rating = ratingEl
          ? parseFloat((await ratingEl.textContent()) ?? '0') || undefined
          : undefined

        const reviewEl = await item.$('.UY7F9')
        const reviewText = reviewEl ? (await reviewEl.textContent()) ?? '' : ''
        const review_count = parseInt(reviewText.replace(/[^0-9]/g, '')) || undefined

        const phoneEl = await item.$('[data-tooltip="Copy phone number"]')
        const phone = phoneEl ? (await phoneEl.textContent())?.trim() : undefined

        const websiteEl = await item.$('a[data-value="Website"]')
        const website = websiteEl ? (await websiteEl.getAttribute('href')) ?? undefined : undefined

        const lead: Lead = {
          business_name: name,
          phone: phone ?? undefined,
          website: website ?? undefined,
          rating,
          review_count,
          city,
          niche,
          score: 0,
        }

        if (website) {
          const emails = await findEmailsOnPage(website)
          if (emails.length > 0) {
            lead.email = emails[0]
          }
        }

        lead.score = scoreLead(lead)
        leads.push(lead)
        console.log(
          `  [${leads.length}/${items.length}] ${name} — score: ${lead.score}${lead.email ? ` — ${lead.email}` : ''}`
        )
      } catch (err) {
        console.error('  Error scraping item:', (err as Error).message)
      }
    }
  } catch (err) {
    console.error(`Scrape error for ${city}:`, (err as Error).message)
  } finally {
    await browser.close()
  }

  return leads
}

async function upsertLeads(leads: Lead[]): Promise<{ inserted: number; withEmail: number }> {
  let inserted = 0
  let withEmail = 0

  for (const lead of leads) {
    if (!lead.email) continue
    withEmail++

    const { error } = await supabase
      .from('leads')
      .upsert(
        {
          business_name: lead.business_name,
          email: lead.email,
          phone: lead.phone ?? null,
          website: lead.website ?? null,
          rating: lead.rating ?? null,
          review_count: lead.review_count ?? null,
          city: lead.city,
          niche: lead.niche,
          score: lead.score,
          status: 'new',
          estimated_value: 400,
        },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (!error) inserted++
  }

  return { inserted, withEmail }
}

async function sendTelegramNotification(
  count: number,
  withEmail: number,
  cities: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const message =
    `🔍 <b>Scrape complete</b>\n` +
    `${count} businesses found in ${cities}\n` +
    `${withEmail} have emails — added to pipeline\n` +
    `Ready to send ✅`

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch {}
}

async function main() {
  const [, , nicheArg, citiesArg, countArg] = process.argv

  if (!nicheArg || !citiesArg) {
    console.error('Usage: npm run scrape -- "HVAC and plumbing" "City1,City2" 400')
    process.exit(1)
  }

  const cities = citiesArg.split(',').map(c => c.trim()).filter(Boolean)
  const maxPerCity = Math.ceil(parseInt(countArg ?? '400') / cities.length)

  const niches = nicheArg.toLowerCase().includes(' and ')
    ? nicheArg.split(/\s+and\s+/i).map(n => n.trim())
    : [nicheArg]

  console.log(`\nOutreach OS Scraper`)
  console.log(`Niches: ${niches.join(', ')}`)
  console.log(`Cities: ${cities.join(', ')}`)
  console.log(`Max per city/niche: ${maxPerCity}`)
  console.log('─'.repeat(50))

  const allLeads: Lead[] = []

  for (const city of cities) {
    for (const niche of niches) {
      const leads = await scrapeCity(niche, city, maxPerCity)
      allLeads.push(...leads)
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Total scraped: ${allLeads.length}`)

  const { inserted, withEmail } = await upsertLeads(allLeads)
  console.log(`Inserted: ${inserted} (${withEmail} had emails)`)

  await sendTelegramNotification(allLeads.length, withEmail, cities.join(', '))
  console.log('\nTelegram notification sent.')
  console.log('Done.')
}

main().catch(console.error)
