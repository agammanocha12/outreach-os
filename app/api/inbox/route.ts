import { supabaseService } from '@/lib/supabase'
import { getSuggestedResponse } from '@/lib/reply-classifier'
import type { Settings, ReplyCategory } from '@/lib/types'

export async function GET() {
  try {
    const { data: settings } = await supabaseService
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    const s = settings as Settings

    const { data: replies, error } = await supabaseService
      .from('replies')
      .select(`
        *,
        leads (id, business_name, first_name, owner_name, estimated_value),
        sends (subject)
      `)
      .eq('handled', false)
      .order('received_at', { ascending: false })

    if (error) throw error

    const enriched = (replies ?? []).map((r: {
      id: string
      send_id: string
      lead_id: string
      body: string | null
      category: ReplyCategory
      handled: boolean
      received_at: string
      leads: { business_name: string; first_name: string | null; owner_name: string | null; estimated_value: number } | null
    }) => {
      const lead = r.leads
      const firstName = lead?.first_name || lead?.owner_name?.split(' ')[0] || 'there'
      const suggestedResponse = getSuggestedResponse(r.category, {
        first_name: firstName,
        business_name: lead?.business_name ?? '',
        booking_link: s?.booking_link ?? '',
        monthly_price: s?.monthly_price ?? 400,
        full_name: s?.full_name ?? '',
      })
      return {
        ...r,
        business_name: lead?.business_name ?? '',
        suggested_response: suggestedResponse,
      }
    })

    return Response.json(enriched)
  } catch (err) {
    console.error('GET inbox error:', err)
    return Response.json({ error: 'Failed to load inbox' }, { status: 500 })
  }
}
