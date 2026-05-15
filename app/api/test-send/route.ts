import { supabaseService } from '@/lib/supabase'
import { sendEmail } from '@/lib/gmail'
import { buildEmail } from '@/lib/templates'
import type { Lead, Settings } from '@/lib/types'

export async function POST() {
  try {
    const { data: settings, error } = await supabaseService
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !settings) {
      return Response.json({ error: 'Could not load settings', detail: error?.message }, { status: 500 })
    }

    if (!settings.gmail_refresh_token) {
      return Response.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    const fakeLead: Lead = {
      id: 'test-lead',
      business_name: settings.business_name ?? 'Test Business',
      email: settings.gmail_address,
      owner_name: settings.full_name,
      first_name: settings.full_name?.split(' ')[0] ?? 'there',
      city: 'Test City',
      niche: 'HVAC',
      score: 80,
      status: 'new',
      rating: 4.8,
      review_count: 150,
      website: null,
      phone: null,
      estimated_value: 400,
      notes: null,
      created_at: new Date().toISOString(),
    }

    const { data: sendRow } = await supabaseService
      .from('sends')
      .insert({
        lead_id: null,
        email_number: 1,
        status: 'queued',
        scheduled_for: new Date().toISOString(),
      })
      .select()
      .single()

    if (!sendRow) {
      return Response.json({ error: 'Could not create send record' }, { status: 500 })
    }

    const { subject, html, variantId } = buildEmail(fakeLead, settings as Settings, 1, sendRow.id, 0)

    await supabaseService
      .from('sends')
      .update({ subject, body: html, subject_variant: variantId })
      .eq('id', sendRow.id)

    const { messageId, threadId } = await sendEmail(
      { from: settings.gmail_address, to: settings.gmail_address, subject, html },
      settings.gmail_refresh_token
    )

    await supabaseService.from('sends').update({
      gmail_message_id: messageId,
      gmail_thread_id: threadId,
      sent_at: new Date().toISOString(),
      status: 'sent',
    }).eq('id', sendRow.id)

    return Response.json({ ok: true, messageId, sendId: sendRow.id, sentTo: settings.gmail_address })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json({ error: 'Send failed', detail: message }, { status: 500 })
  }
}
