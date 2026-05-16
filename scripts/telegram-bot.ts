import { spawn } from 'child_process'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!
const PROJECT_DIR = path.join(__dirname, '..')

const DEFAULT_NICHE = 'HVAC and plumbing'
const DEFAULT_CITIES = 'Suffolk County NY,Nassau County NY,Queens NY,Long Island NY'
const DEFAULT_COUNT = '400'

let supabase: SupabaseClient | null = null
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  )
}

let jobBusy = false

async function send(text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    })
  } catch (err) {
    console.log(`Failed to send Telegram message: ${(err as Error).message}`)
  }
}

type Command =
  | { type: 'scrape'; niche: string; cities: string; count: string }
  | { type: 'email' }

function parseCommand(text: string): Command | null {
  const lower = text.trim().toLowerCase()
  if (lower === 'email') return { type: 'email' }
  if (lower === 'scrape') return { type: 'scrape', niche: DEFAULT_NICHE, cities: DEFAULT_CITIES, count: DEFAULT_COUNT }
  if (lower.startsWith('scrape')) {
    const rest = text.trim().slice(6).trim()
    if (!rest) return { type: 'scrape', niche: DEFAULT_NICHE, cities: DEFAULT_CITIES, count: DEFAULT_COUNT }
    const parts = rest.split('|').map(p => p.trim())
    if (parts.length >= 2) {
      return {
        type: 'scrape',
        niche: parts[0] || DEFAULT_NICHE,
        cities: parts[1] || DEFAULT_CITIES,
        count: parts[2] || DEFAULT_COUNT,
      }
    }
    return { type: 'scrape', niche: rest, cities: DEFAULT_CITIES, count: DEFAULT_COUNT }
  }
  return null
}

function runScraper(niche: string, cities: string, count: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Spawn node directly with tsx CLI path — avoids the Windows .cmd shell:false bug
    const tsxCli = path.join(PROJECT_DIR, 'node_modules', 'tsx', 'dist', 'cli.mjs')
    const child = spawn(
      process.execPath, // full path to node.exe
      [tsxCli, 'scripts/scrape-maps.ts', niche, cities, count],
      { cwd: PROJECT_DIR, shell: false, stdio: 'pipe' }
    )
    let output = ''
    child.stdout.on('data', (d: Buffer) => { output += d.toString(); process.stdout.write(d) })
    child.stderr.on('data', (d: Buffer) => { output += d.toString(); process.stderr.write(d) })
    child.on('error', (err) => reject(err))
    child.on('close', (code: number) => {
      if (code === 0) resolve()
      else reject(new Error(output.slice(-500) || `Exit code ${code}`))
    })
  })
}

async function runScrapeJob(
  niche: string,
  cities: string,
  count: string,
  source: string
): Promise<void> {
  if (jobBusy) {
    await send(`⏳ A job is already running — request from ${source} skipped (try again when it's done).`)
    return
  }
  jobBusy = true
  await send(
    `🔍 <b>Starting scrape</b> (${source})\nNiche: ${niche}\nCities: ${cities}\nTarget: ${count} businesses\n\nThis takes 5-15 minutes...`
  )
  try {
    await runScraper(niche, cities, count)
    await send('✅ <b>Scrape complete!</b>\n\nSend <code>email</code> to email all found leads now, or they\'ll go out automatically at 10am/2pm.')
  } catch (err) {
    await send(`❌ <b>Scrape failed:</b>\n<code>${(err as Error).message}</code>`)
  } finally {
    jobBusy = false
  }
}

async function runEmailJob(): Promise<void> {
  if (jobBusy) {
    await send('⏳ A job is already running — try again when it finishes.')
    return
  }
  jobBusy = true

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const cronSecret = process.env.CRON_SECRET
  if (!appUrl || !cronSecret) {
    await send('❌ <b>Email failed:</b> APP_URL or CRON_SECRET not configured.')
    jobBusy = false
    return
  }

  await send('📧 <b>Sending emails to all new leads...</b>')

  try {
    let totalSent = 0
    let batches = 0
    while (batches < 20) {
      const res = await fetch(`${appUrl}/api/cron/send`, {
        headers: { authorization: `Bearer ${cronSecret}` },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server error ${res.status}: ${text.slice(0, 300)}`)
      }
      const data = await res.json() as { sent?: number; status?: string }
      if (data.status === 'paused or no gmail') {
        throw new Error('System is paused or Gmail is not connected — check Settings')
      }
      const batch = data.sent ?? 0
      totalSent += batch
      batches++
      if (batch === 0) break
    }
    await send(`✅ <b>Done!</b> Sent ${totalSent} emails to new leads.`)
  } catch (err) {
    await send(`❌ <b>Email failed:</b>\n<code>${(err as Error).message}</code>`)
  } finally {
    jobBusy = false
  }
}

async function pollTelegram() {
  let offset = 0
  await send('🤖 <b>Bot online</b>\n\n• <code>scrape</code> — scrape new leads\n• <code>email</code> — email all new leads now\n• <code>scrape HVAC | Nassau County NY | 200</code> — custom scrape')
  console.log('Telegram bot listening...')

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${TOKEN}/getUpdates?timeout=25&offset=${offset}`
      const res = await fetch(url)
      const data = await res.json() as { ok: boolean; description?: string; result: Array<{ update_id: number; message?: { chat: { id: number }; text?: string } }> }

      if (!data.ok) {
        console.log(`Telegram poll failed: ${data.description}`)
        await new Promise(r => setTimeout(r, 5000))
        continue
      }

      for (const update of data.result) {
        offset = update.update_id + 1
        const msg = update.message
        if (!msg || String(msg.chat.id) !== CHAT_ID) continue

        const text = (msg.text ?? '').trim()
        console.log(`Telegram message: "${text}"`)
        const cmd = parseCommand(text)
        if (!cmd) continue

        if (cmd.type === 'scrape') {
          await runScrapeJob(cmd.niche, cmd.cities, cmd.count, 'Telegram')
        } else if (cmd.type === 'email') {
          await runEmailJob()
        }
      }
    } catch (err) {
      console.log(`Telegram poll error: ${(err as Error).message}`)
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

async function pollSupabaseJobs() {
  if (!supabase) {
    console.log('Supabase not configured — website job polling disabled')
    return
  }

  console.log('Supabase job polling started (every 10s)')
  let tableMissing = false

  while (true) {
    try {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('id, niche, cities, count')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)

      if (error) {
        if (!tableMissing && /does not exist|not found/i.test(error.message)) {
          tableMissing = true
          console.log('scrape_jobs table missing — run the SQL in supabase/schema.sql to enable website Scrape button')
        }
        await new Promise(r => setTimeout(r, 30000))
        continue
      }
      tableMissing = false

      if (data && data.length > 0) {
        const job = data[0]
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', job.id)

        await runScrapeJob(job.niche, job.cities, String(job.count), 'website')

        await supabase
          .from('scrape_jobs')
          .update({ status: 'complete', completed_at: new Date().toISOString() })
          .eq('id', job.id)
      }
    } catch (err) {
      console.log(`Supabase poll error: ${(err as Error).message}`)
    }
    await new Promise(r => setTimeout(r, 10000))
  }
}

pollTelegram()
pollSupabaseJobs()
