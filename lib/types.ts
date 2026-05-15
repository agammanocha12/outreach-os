export type LeadStatus = 'new' | 'sent' | 'opened' | 'replied' | 'demo' | 'customer' | 'dead'
export type SendStatus = 'queued' | 'sent' | 'failed'
export type ReplyCategory = 'HOT' | 'WARM' | 'COLD' | 'COMPETITOR' | 'OOO' | 'UNKNOWN'

export interface Lead {
  id: string
  business_name: string
  owner_name: string | null
  first_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  rating: number | null
  review_count: number | null
  city: string | null
  niche: string | null
  score: number
  status: LeadStatus
  notes: string | null
  estimated_value: number
  created_at: string
}

export interface Send {
  id: string
  lead_id: string
  email_number: number
  subject_variant: string | null
  subject: string | null
  body: string | null
  scheduled_for: string | null
  sent_at: string | null
  opened_at: string | null
  open_count: number
  replied_at: string | null
  gmail_message_id: string | null
  gmail_thread_id: string | null
  status: SendStatus
  created_at: string
}

export interface Reply {
  id: string
  send_id: string
  lead_id: string
  body: string | null
  category: ReplyCategory
  handled: boolean
  received_at: string
}

export interface Settings {
  id: number
  full_name: string | null
  business_name: string | null
  phone: string | null
  physical_address: string | null
  gmail_address: string | null
  gmail_refresh_token: string | null
  send_rate: number
  demo_link: string | null
  booking_link: string | null
  monthly_price: number
  niche: string | null
  cities: string[] | null
  value_prop: string | null
  paused: boolean
}
