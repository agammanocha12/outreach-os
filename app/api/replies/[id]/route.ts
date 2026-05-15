import { supabaseService } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const updates = await request.json()
    const allowed = ['handled', 'category']
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    )
    const { data, error } = await supabaseService
      .from('replies')
      .update(filtered)
      .eq('id', id)
      .select()
      .single()
    if (error) return Response.json({ error: 'Update failed' }, { status: 400 })
    return Response.json(data)
  } catch (err) {
    console.error('PATCH reply error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
