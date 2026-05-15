import { supabaseService } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseService
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (error) throw error
    const { gmail_refresh_token, ...safe } = data
    return Response.json({ ...safe, gmail_connected: !!gmail_refresh_token })
  } catch (err) {
    console.error('GET settings error:', err)
    return Response.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { gmail_refresh_token: _, id: __, ...updates } = body
    const { data, error } = await supabaseService
      .from('settings')
      .update(updates)
      .eq('id', 1)
      .select()
      .single()
    if (error) throw error
    const { gmail_refresh_token: _t, ...safe } = data
    return Response.json(safe)
  } catch (err) {
    console.error('PUT settings error:', err)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
