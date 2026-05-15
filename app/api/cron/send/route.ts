import { supabaseService } from '@/lib/supabase'
import { sendEmail } from '@/lib/gmail'
import { buildEmail } from '@/lib/templates'
import { notify } from '@/lib/telegram'
import { NextRequest } from 'next/server'
import type { Lead, Settings } from '@/lib/types'
import { subDays } from 'date-fns'

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

  if (!settings || settings.paused || !settings.gmail_refresh_token) {
    return Response.json({ status: 'paused or no gmail' })
  }

  const s = settings as Settings
  const utcHour = new Date().getUTCHours()
  const isMorning = utcHour === 14
  const isAfternoon = utcHour === 18

  if (!isMorning && !isAfternoon) {
    return Response.json({ status: 'not send time', hour: utcHour })
  }

  const halfRate = Math.floor((s.send_rate ?? 40) / 2)

  const { count: totalSentEver } = await supabaseService
    .from('sends')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')

  const variantBase = totalSentEver ?? 0

  const toSend: Array<{ lead: Lead; emailNum: 1 | 2 | 3 | 4; threadId?: string }> = []

  if (isMorning) {
    const { data: newLeads } = await supabaseService
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .not('email', 'is', null)
      .order('score', { ascending: false })
      .limit(halfRate)

    for (const lead of (newLeads ?? []) as Lead[]) {
      toSend.push({ lead, emailNum: 1 })
    }

    const followUps = await getFollowUps(halfRate - toSend.length)
    toSend.push(...followUps)
  } else {
    const { data: newLeads } = await supabaseService
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .not('email', 'is', null)
      .order('score', { ascending: false })
      .limit(halfRate)

    for (const lead of (newLeads ?? []) as Lead[]) {
      toSend.push({ lead, emailNum: 1 })
    }

    const followUps = await getFollowUps(halfRate - toSend.length)
    toSend.push(...followUps)
  }

  let sentCount = 0

  for (let i = 0; i < toSend.length; i++) {
    const { lead, emailNum, threadId } = toSend[i]
    try {
      const { data: sendRow } = await supabaseService
        .from('sends')
        .insert({
          lead_id: lead.id,
          email_number: emailNum,
          status: 'queued',
          scheduled_for: new Date().toISOString(),
          ...(threadId ? { gmail_thread_id: threadId } : {}),
        })
        .select()
        .single()

      if (!sendRow) continue

      const { subject: finalSubject, html: finalHtml, variantId: finalVariant } = buildEmail(
        lead,
        s,
        emailNum,
        sendRow.id,
        variantBase + sentCount
      )

      await supabaseService
        .from('sends')
        .update({ subject: finalSubject, body: finalHtml, subject_variant: finalVariant })
        .eq('id', sendRow.id)

      const { messageId, threadId: newThreadId } = await sendEmail(
        { to: lead.email!, subject: finalSubject, html: finalHtml, threadId },
        s.gmail_refresh_token!
      )

      await supabaseService.from('sends').update({
        gmail_message_id: messageId,
        gmail_thread_id: newThreadId,
        sent_at: new Date().toISOString(),
        status: 'sent',
      }).eq('id', sendRow.id)

      if (emailNum === 1) {
        await supabaseService
          .from('leads')
          .update({ status: 'sent' })
          .eq('id', lead.id)
          .eq('status', 'new')
      }

      sentCount++
    } catch (err) {
      console.error(`Failed to send to ${lead.email}:`, err)
    }
  }

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { count: totalToday } = await supabaseService
    .from('sends')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', todayStart.toISOString())

  const { count: opensToday } = await supabaseService
    .from('sends')
    .select('*', { count: 'exact', head: true })
    .gte('opened_at', todayStart.toISOString())

  const firstCity = s.cities?.[0] ?? 'your area'

  if (isMorning) {
    await notify.morningBatchSent(sentCount, opensToday ?? 0, firstCity)
  } else {
    await notify.afternoonBatchSent(sentCount, totalToday ?? 0, opensToday ?? 0)

    const { count: totalReplies } = await supabaseService
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .gte('received_at', todayStart.toISOString())

    const { count: hotReplies } = await supabaseService
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'HOT')
      .gte('received_at', todayStart.toISOString())

    const { count: warmReplies } = await supabaseService
      .from('replies')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'WARM')
      .gte('received_at', todayStart.toISOString())

    const { data: customers } = await supabaseService
      .from('leads')
      .select('estimated_value')
      .eq('status', 'customer')

    const customerCount = customers?.length ?? 0
    const mrr = (customers ?? []).reduce(
      (s: number, c: { estimated_value: number }) => s + (c.estimated_value ?? 400),
      0
    )

    const { count: pipelineLeads } = await supabaseService
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['sent', 'opened', 'replied', 'demo'])

    const sent = totalToday ?? 0
    const opens = opensToday ?? 0

    await notify.dailySummary({
      sent,
      opens,
      openRate: sent > 0 ? (opens / sent) * 100 : 0,
      replies: totalReplies ?? 0,
      hot: hotReplies ?? 0,
      warm: warmReplies ?? 0,
      customers: customerCount,
      mrr,
      pipelineLeads: pipelineLeads ?? 0,
    })
  }

  return Response.json({ sent: sentCount })
}

async function getFollowUps(
  limit: number
): Promise<Array<{ lead: Lead; emailNum: 2 | 3 | 4; threadId?: string }>> {
  if (limit <= 0) return []
  const result: Array<{ lead: Lead; emailNum: 2 | 3 | 4; threadId?: string }> = []

  const cutoff2 = subDays(new Date(), 3).toISOString()
  const cutoff3 = subDays(new Date(), 4).toISOString()
  const cutoff4 = subDays(new Date(), 7).toISOString()

  const { data: e1Sends } = await supabaseService
    .from('sends')
    .select('lead_id, gmail_thread_id, leads!inner(id, email, status, business_name, first_name, owner_name, score, rating, review_count, website, phone, city, niche, notes, estimated_value, created_at)')
    .eq('email_number', 1)
    .eq('status', 'sent')
    .is('replied_at', null)
    .lte('sent_at', cutoff2)
    .limit(limit * 3)

  for (const s of (e1Sends ?? []) as unknown as Array<{ lead_id: string; gmail_thread_id: string | null; leads: Lead }>) {
    if (result.length >= limit) break
    const { data: already } = await supabaseService
      .from('sends')
      .select('id')
      .eq('lead_id', s.lead_id)
      .eq('email_number', 2)
      .limit(1)
    if (!already || already.length === 0) {
      result.push({ lead: s.leads, emailNum: 2, threadId: s.gmail_thread_id ?? undefined })
    }
  }

  if (result.length < limit) {
    const { data: e2Sends } = await supabaseService
      .from('sends')
      .select('lead_id, gmail_thread_id, leads!inner(id, email, status, business_name, first_name, owner_name, score, rating, review_count, website, phone, city, niche, notes, estimated_value, created_at)')
      .eq('email_number', 2)
      .eq('status', 'sent')
      .is('replied_at', null)
      .lte('sent_at', cutoff3)
      .limit(limit * 3)

    for (const s of (e2Sends ?? []) as unknown as Array<{ lead_id: string; gmail_thread_id: string | null; leads: Lead }>) {
      if (result.length >= limit) break
      const { data: already } = await supabaseService
        .from('sends')
        .select('id')
        .eq('lead_id', s.lead_id)
        .eq('email_number', 3)
        .limit(1)
      if (!already || already.length === 0) {
        result.push({ lead: s.leads, emailNum: 3, threadId: s.gmail_thread_id ?? undefined })
      }
    }
  }

  if (result.length < limit) {
    const { data: e3Sends } = await supabaseService
      .from('sends')
      .select('lead_id, gmail_thread_id, leads!inner(id, email, status, business_name, first_name, owner_name, score, rating, review_count, website, phone, city, niche, notes, estimated_value, created_at)')
      .eq('email_number', 3)
      .eq('status', 'sent')
      .is('replied_at', null)
      .lte('sent_at', cutoff4)
      .limit(limit * 3)

    for (const s of (e3Sends ?? []) as unknown as Array<{ lead_id: string; gmail_thread_id: string | null; leads: Lead }>) {
      if (result.length >= limit) break
      const { data: already } = await supabaseService
        .from('sends')
        .select('id')
        .eq('lead_id', s.lead_id)
        .eq('email_number', 4)
        .limit(1)
      if (!already || already.length === 0) {
        result.push({ lead: s.leads, emailNum: 4, threadId: s.gmail_thread_id ?? undefined })
      }
    }
  }

  return result
}
