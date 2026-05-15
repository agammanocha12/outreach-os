'use client'
import { useEffect, useState } from 'react'
import ConnectGmailButton from '@/components/ConnectGmailButton'
import { useSearchParams } from 'next/navigation'
import { Save, Bell } from 'lucide-react'
import { Suspense } from 'react'

interface SettingsData {
  full_name: string
  business_name: string
  phone: string
  physical_address: string
  gmail_address: string
  send_rate: number
  demo_link: string
  booking_link: string
  monthly_price: number
  niche: string
  cities: string[]
  value_prop: string
  paused: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0f0f5]">
        <h2 className="text-[14px] font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f] placeholder-[#86868b]"
      />
    </div>
  )
}

function SettingsInner() {
  const params = useSearchParams()
  const justConnected = params.get('connected') === '1'

  const [settings, setSettings] = useState<SettingsData>({
    full_name: '', business_name: '', phone: '', physical_address: '',
    gmail_address: '', send_rate: 40, demo_link: '', booking_link: '',
    monthly_price: 400, niche: '', cities: [], value_prop: '', paused: true,
  })
  const [gmailConnected, setGmailConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [telegramMsg, setTelegramMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const d = await res.json()
          setSettings({
            full_name: d.full_name ?? '', business_name: d.business_name ?? '',
            phone: d.phone ?? '', physical_address: d.physical_address ?? '',
            gmail_address: d.gmail_address ?? '', send_rate: d.send_rate ?? 40,
            demo_link: d.demo_link ?? '', booking_link: d.booking_link ?? '',
            monthly_price: d.monthly_price ?? 400, niche: d.niche ?? '',
            cities: d.cities ?? [], value_prop: d.value_prop ?? '', paused: d.paused ?? true,
          })
          setGmailConnected(!!d.gmail_connected || justConnected)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [justConnected])

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaveMsg(res.ok ? '✓ Saved' : 'Error saving')
    } catch {
      setSaveMsg('Error saving')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  async function handleTestTelegram() {
    setTestingTelegram(true)
    setTelegramMsg('')
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' })
      setTelegramMsg(res.ok ? '✓ Message sent — check Telegram' : 'Failed — check your token and chat ID')
    } catch {
      setTelegramMsg('Failed to send')
    } finally {
      setTestingTelegram(false)
    }
  }

  function update(key: keyof SettingsData, value: string | number | boolean | string[]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="p-8 text-[13px] text-[#86868b]">Loading settings…</div>

  return (
    <div className="p-8 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-[13px] text-[#6e6e73]">{saveMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#0071e3' }}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {justConnected && (
        <div className="bg-[#e6f9ed] rounded-2xl p-4 text-[13px] text-[#1a7a3a] font-medium">
          Gmail connected successfully — sending is enabled.
        </div>
      )}

      <Section title="Sending Status">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#1d1d1f]">
              {settings.paused ? 'Paused' : 'Running'}
            </p>
            <p className="text-[12px] text-[#86868b] mt-0.5">
              {settings.paused
                ? 'No emails will be sent. Flip to start.'
                : 'Emails send at 10am ET on weekdays.'}
            </p>
          </div>
          <button
            onClick={() => update('paused', !settings.paused)}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
            style={{ background: settings.paused ? '#d2d2d7' : '#34c759' }}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: settings.paused ? 'translateX(4px)' : 'translateX(24px)' }}
            />
          </button>
        </div>
      </Section>

      <Section title="Gmail">
        <ConnectGmailButton
          connected={gmailConnected}
          gmailAddress={settings.gmail_address || null}
          onDisconnect={() => setGmailConnected(false)}
        />
      </Section>

      <Section title="Your Info">
        <Field label="Full name" value={settings.full_name} onChange={v => update('full_name', v)} />
        <Field label="Business name" value={settings.business_name} onChange={v => update('business_name', v)} />
        <Field label="Phone (appears in emails)" value={settings.phone} onChange={v => update('phone', v)} />
        <Field label="Mailing address (CAN-SPAM)" value={settings.physical_address} onChange={v => update('physical_address', v)} />
      </Section>

      <Section title="Campaign">
        <div>
          <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Monthly price ($)</label>
          <input
            type="number"
            value={settings.monthly_price}
            onChange={e => update('monthly_price', parseInt(e.target.value) || 0)}
            className="rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f] w-32"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">
            Daily send rate — {settings.send_rate}/day
          </label>
          <input
            type="range" min={10} max={50} step={5}
            value={settings.send_rate}
            onChange={e => update('send_rate', parseInt(e.target.value))}
            className="w-48 accent-[#0071e3]"
          />
          <div className="flex justify-between text-[11px] text-[#86868b] w-48 mt-1">
            <span>10</span><span>40 rec.</span><span>50</span>
          </div>
        </div>
        <Field label="Niche (e.g. HVAC and plumbing)" value={settings.niche} onChange={v => update('niche', v)} />
        <div>
          <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Target cities (comma-separated)</label>
          <textarea
            value={settings.cities.join(', ')}
            onChange={e => update('cities', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
            rows={2}
            className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
          />
        </div>
        <Field label="Value prop (one sentence)" value={settings.value_prop} onChange={v => update('value_prop', v)} />
      </Section>

      <Section title="Links">
        <Field label="Demo video link (Loom)" value={settings.demo_link} onChange={v => update('demo_link', v)} placeholder="https://loom.com/share/..." />
        <Field label="Calendly booking link" value={settings.booking_link} onChange={v => update('booking_link', v)} placeholder="https://calendly.com/..." />
      </Section>

      <Section title="Telegram Notifications">
        <p className="text-[13px] text-[#6e6e73] leading-relaxed">
          Bot token and chat ID are set via environment variables in your Vercel project settings.
        </p>
        <div>
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#1d1d1f' }}
          >
            <Bell size={14} />
            {testingTelegram ? 'Sending…' : 'Test notification'}
          </button>
          {telegramMsg && <p className="text-[13px] text-[#6e6e73] mt-2">{telegramMsg}</p>}
        </div>
      </Section>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[13px] text-[#86868b]">Loading…</div>}>
      <SettingsInner />
    </Suspense>
  )
}
