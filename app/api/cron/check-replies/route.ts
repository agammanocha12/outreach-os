import { supabaseService } from '@/lib/supabase'
import { listMessagesAfter, getMessageBody } from '@/lib/gmail'
import { classifyReply, getSuggestedResponse } from '@/lib/reply-classifier'
import { notify } from '@/lib/telegram'
import { NextRequest } from 'next/server'
import type { Settings } from '@/lib/types'

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabaseService
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (!settings?.gmail_refresh_token) {
    return Response.json({ status: 'no gmail connected' })
  }

  const s = settings as Settings
  const since = new Date(Date.now() - 10 * 60 * 60 * 1000)

  let messages: { id?: string | null }[] = []
  try {
    messages = await listMessagesAfter(since, s.gmail_refresh_token!)
  } catch (err) {
    console.error('Failed to list messages:', err)
    return Response.json({ error: 'Gmail list failed' }, { status: 500 })
  }

  let processed = 0

  for (const msg of messages) {
    if (!msg.id) continue
    try {
      const { body, threadId } = await getMessageBody(msg.id, s.gmail_refresh_token!)

      const { data: send } = await supabaseService
        .from('sends')
        .select('id, lead_id, leads(id, business_name, first_name, owner_name, estimated_value)')
        .eq('gmail_thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!send) continue

      const { data: existing } = await supabaseService
        .from('replies')
        .select('id')
        .eq('send_id', send.id)
        .limit(1)

      if (existing && existing.length > 0) continue

      const { category } = classifyReply(body)
      const lead = (send as unknown as { leads: { business_name: string; first_name: string | null; owner_name: string | null; estimated_value: number } }).leads

      const firstName =
        lead.first_name || lead.owner_name?.split(' ')[0] || 'there'

      const suggestedResponse = getSuggestedResponse(category, {
        first_name: firstName,
        business_name: lead.business_name,
        booking_link: s.booking_link ?? '',
        monthly_price: s.monthly_price ?? 400,
        full_name: s.full_name ?? '',
      })

      await supabaseService.from('replies').insert({
        send_id: send.id,
        lead_id: send.lead_id,
        body,
        category,
        handled: category === 'OOO',
      })

      await supabaseService
        .from('sends')
        .update({ replied_at: new Date().toISOString() })
        .eq('id', send.id)

      await supabaseService
        .from('leads')
        .update({ status: 'replied' })
        .eq('id', send.lead_id)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

      if (category === 'HOT') {
        await notify.hotReply(lead.business_name, body, appUrl)
      } else if (category === 'WARM') {
        await notify.warmReply(lead.business_name)
      } else if (category === 'OOO') {
        const requeue = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await supabaseService.from('leads').update({
          status: 'new',
          notes: `OOO — re-queue after ${requeue}`,
        }).eq('id', send.lead_id)
      }

      void suggestedResponse
      processed++
    } catch (err) {
      console.error(`Error processing message ${msg.id}:`, err)
    }
  }

  return Response.json({ processed, total: messages.length })
}
