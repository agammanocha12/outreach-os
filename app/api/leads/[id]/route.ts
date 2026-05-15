import { supabaseService } from '@/lib/supabase'
import { notify } from '@/lib/telegram'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { data, error } = await supabaseService
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(data)
  } catch (err) {
    console.error('GET lead error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const updates = await request.json()
    const { data, error } = await supabaseService
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return Response.json({ error: 'Update failed' }, { status: 400 })

    if (updates.status === 'customer') {
      const { data: customers } = await supabaseService
        .from('leads')
        .select('estimated_value')
        .eq('status', 'customer')
      const totalMrr = (customers ?? []).reduce(
        (sum: number, c: { estimated_value: number }) => sum + (c.estimated_value ?? 200),
        0
      )
      await notify.newCustomer(data.business_name, data.estimated_value ?? 200, totalMrr)
    }

    return Response.json(data)
  } catch (err) {
    console.error('PATCH lead error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await supabaseService.from('leads').delete().eq('id', id)
    if (error) return Response.json({ error: 'Delete failed' }, { status: 400 })
    return Response.json({ success: true })
  } catch (err) {
    console.error('DELETE lead error:', err)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
