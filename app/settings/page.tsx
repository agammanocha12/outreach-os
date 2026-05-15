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

function SettingsInner() {
  const params = useSearchParams()
  const justConnected = params.get('connected') === '1'

  const [settings, setSettings] = useState<SettingsData>({
    full_name: '',
    business_name: '',
    phone: '',
    physical_address: '',
    gmail_address: '',
    send_rate: 40,
    demo_link: '',
    booking_link: '',
    monthly_price: 400,
    niche: '',
    cities: [],
    value_prop: '',
    paused: true,
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
            full_name: d.full_name ?? '',
            business_name: d.business_name ?? '',
            phone: d.phone ?? '',
            physical_address: d.physical_address ?? '',
            gmail_address: d.gmail_address ?? '',
            send_rate: d.send_rate ?? 40,
            demo_link: d.demo_link ?? '',
            booking_link: d.booking_link ?? '',
            monthly_price: d.monthly_price ?? 400,
            niche: d.niche ?? '',
            cities: d.cities ?? [],
            value_prop: d.value_prop ?? '',
            paused: d.paused ?? true,
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
        body: JSON.stringify({
          ...settings,
          cities: settings.cities,
        }),
      })
      if (res.ok) {
        setSaveMsg('✓ Saved')
      } else {
        setSaveMsg('Error saving')
      }
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
      if (res.ok) {
        setTelegramMsg('✓ Message sent — check Telegram')
      } else {
        setTelegramMsg('Failed — check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local')
      }
    } catch {
      setTelegramMsg('Failed to send')
    } finally {
      setTestingTelegram(false)
    }
  }

  function update(key: keyof SettingsData, value: string | number | boolean | string[]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="p-6 text-gray-400">Loading settings…</div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm text-gray-500">{saveMsg}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {justConnected && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          Gmail connected successfully! Sending is enabled.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Sending Status</h2>
          <button
            onClick={() => update('paused', !settings.paused)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              settings.paused ? 'bg-gray-300' : 'bg-green-500'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                settings.paused ? 'translate-x-1' : 'translate-x-6'
              }`}
            />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {settings.paused
            ? '⏸ Paused — no emails will be sent. Flip to start.'
            : '▶ Running — emails send at 10am and 2pm weekdays.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Gmail</h2>
        <ConnectGmailButton
          connected={gmailConnected}
          gmailAddress={settings.gmail_address || null}
          onDisconnect={() => setGmailConnected(false)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Your Info</h2>
        <Field label="Full name" value={settings.full_name} onChange={v => update('full_name', v)} />
        <Field label="Business name" value={settings.business_name} onChange={v => update('business_name', v)} />
        <Field label="Phone (appears in emails)" value={settings.phone} onChange={v => update('phone', v)} />
        <Field label="Mailing address (CAN-SPAM)" value={settings.physical_address} onChange={v => update('physical_address', v)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Campaign</h2>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Monthly price ($)</label>
          <input
            type="number"
            value={settings.monthly_price}
            onChange={e => update('monthly_price', parseInt(e.target.value) || 0)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Daily send rate ({settings.send_rate}/day)
          </label>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={settings.send_rate}
            onChange={e => update('send_rate', parseInt(e.target.value))}
            className="w-48"
          />
          <div className="flex justify-between text-xs text-gray-400 w-48">
            <span>10 (safe)</span>
            <span>40 (rec.)</span>
            <span>50 (max)</span>
          </div>
        </div>
        <Field label="Niche (e.g. HVAC and plumbing)" value={settings.niche} onChange={v => update('niche', v)} />
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Target cities (comma-separated)
          </label>
          <textarea
            value={settings.cities.join(', ')}
            onChange={e => update('cities', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Field label="Value prop (one sentence)" value={settings.value_prop} onChange={v => update('value_prop', v)} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Links</h2>
        <Field label="Demo video link (Loom)" value={settings.demo_link} onChange={v => update('demo_link', v)} placeholder="https://loom.com/share/..." />
        <Field label="Calendly booking link" value={settings.booking_link} onChange={v => update('booking_link', v)} placeholder="https://calendly.com/..." />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Telegram Notifications</h2>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Bot Token and Chat ID are set in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file.</p>
          <p>
            <code className="bg-gray-100 px-1 rounded">TELEGRAM_BOT_TOKEN</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">TELEGRAM_CHAT_ID</code>
          </p>
        </div>
        <div>
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            <Bell size={15} />
            {testingTelegram ? 'Sending…' : 'Test notification'}
          </button>
          {telegramMsg && <p className="text-sm text-gray-600 mt-2">{telegramMsg}</p>}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <SettingsInner />
    </Suspense>
  )
}
