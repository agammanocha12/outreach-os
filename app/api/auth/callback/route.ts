import { exchangeCodeForTokens } from '@/lib/gmail'
import { supabaseService } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return Response.json({ error: 'Missing code' }, { status: 400 })
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens.refresh_token) {
      return Response.json(
        { error: 'No refresh token returned. Revoke app access and re-authorize.' },
        { status: 400 }
      )
    }
    await supabaseService
      .from('settings')
      .update({ gmail_refresh_token: tokens.refresh_token, paused: false })
      .eq('id', 1)
  } catch (err) {
    console.error('OAuth callback error:', err)
    return Response.json({ error: 'OAuth failed' }, { status: 500 })
  }

  redirect('/settings?connected=1')
}
