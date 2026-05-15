import { supabaseService } from '@/lib/supabase'

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const todayISO = todayStart.toISOString()

    const [
      { count: totalLeads },
      { count: sentToday },
      { count: totalSent },
      { count: totalOpens },
      { count: totalReplies },
      { count: hotReplies },
      { count: warmReplies },
      { count: unhandledReplies },
      { data: customers },
      { count: pipelineLeads },
      { data: variantStats },
      { data: recentActivity },
      { count: leadsSent },
      { count: leadsOpened },
      { count: leadsReplied },
      { count: leadsDemo },
    ] = await Promise.all([
      supabaseService.from('leads').select('*', { count: 'exact', head: true }),
      supabaseService.from('sends').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', todayISO),
      supabaseService.from('sends').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      supabaseService.from('sends').select('*', { count: 'exact', head: true }).not('opened_at', 'is', null),
      supabaseService.from('replies').select('*', { count: 'exact', head: true }),
      supabaseService.from('replies').select('*', { count: 'exact', head: true }).eq('category', 'HOT'),
      supabaseService.from('replies').select('*', { count: 'exact', head: true }).eq('category', 'WARM'),
      supabaseService.from('replies').select('*', { count: 'exact', head: true }).eq('handled', false),
      supabaseService.from('leads').select('estimated_value').eq('status', 'customer'),
      supabaseService.from('leads').select('*', { count: 'exact', head: true }).in('status', ['sent', 'opened', 'replied', 'demo']),
      supabaseService.from('sends').select('subject_variant').eq('status', 'sent').not('subject_variant', 'is', null),
      supabaseService.from('sends').select('id, sent_at, subject, leads(business_name)').eq('status', 'sent').order('sent_at', { ascending: false }).limit(10),
      supabaseService.from('leads').select('*', { count: 'exact', head: true }).in('status', ['sent', 'opened', 'replied', 'demo', 'customer']),
      supabaseService.from('leads').select('*', { count: 'exact', head: true }).in('status', ['opened', 'replied', 'demo', 'customer']),
      supabaseService.from('leads').select('*', { count: 'exact', head: true }).in('status', ['replied', 'demo', 'customer']),
      supabaseService.from('leads').select('*', { count: 'exact', head: true }).in('status', ['demo', 'customer']),
    ])

    const customerCount = customers?.length ?? 0
    const mrr = (customers ?? []).reduce(
      (s: number, c: { estimated_value: number }) => s + (c.estimated_value ?? 400),
      0
    )

    const variantCounts: Record<string, number> = { A: 0, B: 0, C: 0 }
    for (const row of variantStats ?? []) {
      if (row.subject_variant && variantCounts[row.subject_variant] !== undefined) {
        variantCounts[row.subject_variant]++
      }
    }

    const replyRate =
      totalSent && totalSent > 0 ? ((totalReplies ?? 0) / totalSent) * 100 : 0

    return Response.json({
      totalLeads: totalLeads ?? 0,
      sentToday: sentToday ?? 0,
      totalSent: totalSent ?? 0,
      totalOpens: totalOpens ?? 0,
      totalReplies: totalReplies ?? 0,
      hotReplies: hotReplies ?? 0,
      warmReplies: warmReplies ?? 0,
      unhandledReplies: unhandledReplies ?? 0,
      customers: customerCount,
      mrr,
      pipelineLeads: pipelineLeads ?? 0,
      replyRate: Math.round(replyRate * 10) / 10,
      variantCounts,
      recentActivity: recentActivity ?? [],
      funnel: {
        leads: totalLeads ?? 0,
        sent: leadsSent ?? 0,
        opened: leadsOpened ?? 0,
        replied: leadsReplied ?? 0,
        demo: leadsDemo ?? 0,
        customer: customerCount,
      },
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return Response.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
