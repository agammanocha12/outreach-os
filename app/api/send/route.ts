import { supabaseService } from '@/lib/supabase'
import { sendEmail } from '@/lib/gmail'
import { buildEmail } from '@/lib/templates'
import type { Lead, Settings } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { count = 1 } = await request.json()

    const { data: settings } = await supabaseService
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!settings?.gmail_refresh_token) {
      return Response.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    const { data: leads } = await supabaseService
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .not('email', 'is', null)
      .order('score', { ascending: false })
      .limit(count)

    if (!leads || leads.length === 0) {
      return Response.json({ sent: 0, message: 'No leads to send to' })
    }

    const { count: totalSends } = await supabaseService
      .from('sends')
      .select('*', { count: 'exact', head: true })

    let sentCount = 0

    for (const lead of leads as Lead[]) {
      try {
        const variantIndex = (totalSends ?? 0) + sentCount

        const { data: sendRow } = await supabaseService
          .from('sends')
          .insert({
            lead_id: lead.id,
            email_number: 1,
            status: 'queued',
            scheduled_for: new Date().toISOString(),
          })
          .select()
          .single()

        if (!sendRow) continue

        const { subject, html, variantId } = buildEmail(
          lead,
          settings as Settings,
          1,
          sendRow.id,
          variantIndex
        )

        await supabaseService
          .from('sends')
          .update({ subject, body: html, subject_variant: variantId })
          .eq('id', sendRow.id)

        const { messageId, threadId } = await sendEmail(
          { to: lead.email!, subject, html },
          settings.gmail_refresh_token!
        )

        await supabaseService.from('sends').update({
          gmail_message_id: messageId,
          gmail_thread_id: threadId,
          sent_at: new Date().toISOString(),
          status: 'sent',
        }).eq('id', sendRow.id)

        await supabaseService
          .from('leads')
          .update({ status: 'sent' })
          .eq('id', lead.id)

        sentCount++
      } catch (err) {
        console.error(`Failed to send to ${lead.email}:`, err)
      }
    }

    return Response.json({ sent: sentCount })
  } catch (err) {
    console.error('Send route error:', err)
    return Response.json({ error: 'Send failed' }, { status: 500 })
  }
}
