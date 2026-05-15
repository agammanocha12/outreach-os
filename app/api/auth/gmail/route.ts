import { getAuthUrl } from '@/lib/gmail'
import { redirect } from 'next/navigation'

export async function GET() {
  const url = getAuthUrl()
  redirect(url)
}
