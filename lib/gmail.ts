import { google } from 'googleapis'
import { notify } from './telegram'
import { supabaseService } from './supabase'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
  )
}

export function getAuthUrl(): string {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
    prompt: 'consent',
  })
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  return tokens
}

export async function getGmailClient(refreshToken: string) {
  const client = getOAuth2Client()
  client.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth: client })
}

interface EmailParams {
  from?: string
  to: string
  subject: string
  html: string
  threadId?: string
}

function makeRawEmail({ from, to, subject, html }: Pick<EmailParams, 'from' | 'to' | 'subject' | 'html'>): string {
  const raw = [
    ...(from ? [`From: ${from}`] : []),
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    html,
  ].join('\r\n')
  return Buffer.from(raw).toString('base64url')
}

export async function sendEmail(
  params: EmailParams,
  refreshToken: string
): Promise<{ messageId: string; threadId: string }> {
  try {
    const gmail = await getGmailClient(refreshToken)

    if (!params.from) {
      const { data: settings } = await supabaseService.from('settings').select('gmail_address').eq('id', 1).single()
      params = { ...params, from: settings?.gmail_address ?? undefined }
    }

    const raw = makeRawEmail(params)
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        ...(params.threadId ? { threadId: params.threadId } : {}),
      },
    })
    return { messageId: res.data.id!, threadId: res.data.threadId! }
  } catch (err: unknown) {
    if (isInvalidGrant(err)) {
      await handleInvalidGrant()
    }
    throw err
  }
}

export async function listMessagesAfter(since: Date, refreshToken: string) {
  try {
    const gmail = await getGmailClient(refreshToken)
    const sinceUnix = Math.floor(since.getTime() / 1000)
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread in:inbox after:${sinceUnix}`,
      maxResults: 100,
    })
    return res.data.messages || []
  } catch (err: unknown) {
    if (isInvalidGrant(err)) {
      await handleInvalidGrant()
    }
    throw err
  }
}

export async function getMessageBody(messageId: string, refreshToken: string) {
  const gmail = await getGmailClient(refreshToken)
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })
  const msg = res.data
  const threadId = msg.threadId ?? ''
  const headers = msg.payload?.headers ?? []
  const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value ?? ''
  const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value ?? ''

  let body = ''
  const parts = msg.payload?.parts
  if (parts) {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8')
        break
      }
    }
    if (!body) {
      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8').replace(/<[^>]+>/g, ' ')
          break
        }
      }
    }
  } else if (msg.payload?.body?.data) {
    body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8')
  }

  return { body, threadId, from, subject, messageId }
}

function isInvalidGrant(err: unknown): boolean {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: string }).message).includes('invalid_grant')
  }
  return false
}

async function handleInvalidGrant() {
  await notify.gmailDisconnected()
  await supabaseService
    .from('settings')
    .update({ paused: true, gmail_refresh_token: null })
    .eq('id', 1)
}
