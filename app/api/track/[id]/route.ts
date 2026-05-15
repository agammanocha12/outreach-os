import { supabaseService } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: send } = await supabaseService
    .from('sends')
    .select('lead_id, opened_at, open_count')
    .eq('id', id)
    .single()

  if (send) {
    if (!send.opened_at) {
      await supabaseService
        .from('sends')
        .update({ opened_at: new Date().toISOString(), open_count: 1 })
        .eq('id', id)
      await supabaseService
        .from('leads')
        .update({ status: 'opened' })
        .eq('id', send.lead_id)
        .in('status', ['new', 'sent'])
    } else {
      await supabaseService
        .from('sends')
        .update({ open_count: (send.open_count ?? 0) + 1 })
        .eq('id', id)
    }
  }

  return new Response(PIXEL, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
}
