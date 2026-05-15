import { sendTelegram } from '@/lib/telegram'

export async function POST() {
  try {
    await sendTelegram('✅ Outreach OS connected to Telegram! Atlas Reception dashboard is live.')
    return Response.json({ success: true })
  } catch (err) {
    console.error('Telegram test error:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
