import { supabaseService } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseService
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
    if (error) throw error
    return Response.json(data ?? [])
  } catch (err) {
    console.error('GET leads error:', err)
    return Response.json({ error: 'Failed to load leads' }, { status: 500 })
  }
}
