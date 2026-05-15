'use client'
import { useState } from 'react'
import { Save } from 'lucide-react'

const DEFAULT_TEMPLATES = [
  {
    num: 1,
    label: 'Email 1 — Initial outreach (Day 1)',
    subjectA: "calls you're missing at {{business_name}}?",
    subjectB: 'missed emergency calls at {{business_name}}?',
    subjectC: '{{first_name}} — quick {{business_name}} question',
    body: "Hey {{first_name}},\n\nQuick math for {{business_name}}: HVAC/plumbing shops typically miss 3-7 calls a day — while techs are on jobs, after 5pm, or during peak season. At $300-1,500 per service call, that's $1,000-7,000 a week going to whoever picks up first.\n\nI built an AI receptionist specifically for HVAC and plumbing. Answers every call 24/7, qualifies the emergency level, books straight into your scheduler (Jobber, Housecall Pro, ServiceTitan, or Google Calendar), and texts you the details. Sounds 100% human.\n\n${{monthly_price}}/mo flat, no contract. Works on your existing number in 10 minutes.\n\nWorth a quick listen?\n\n— {{full_name}}\n{{phone}}\n{{business_name}}\n{{physical_address}}\n\nReply STOP to unsubscribe.",
  },
  {
    num: 2,
    label: 'Email 2 — Bump (Day 3)',
    body: "Hey {{first_name}} — bumping this.\n\nEven one extra service call this week pays for the AI receptionist for 3+ months.\n\nWorth a 60-sec listen?\n\n— {{full_name}}",
  },
  {
    num: 3,
    label: 'Email 3 — Case study (Day 7)',
    body: "{{first_name}},\n\nReal example — a 4-tech HVAC shop ran us for 30 days:\n\n→ 47 calls answered after hours/weekends (all would've been missed)\n→ 14 turned into booked service jobs\n→ $6,200 in new revenue\n→ ${{monthly_price}} cost = 31x return\n\nSame setup for {{business_name}} this week. 10-min install on your existing number.\n\n10-min Zoom to see it live? {{booking_link}}\n\n— {{full_name}}\n{{phone}}",
  },
  {
    num: 4,
    label: 'Email 4 — Breakup (Day 14)',
    body: '{{first_name}} — last note from me.\n\nIf timing\'s off, reply "ping me in 3 months" and I\'ll set a reminder.\n\nOtherwise wishing {{business_name}} a busy season.\n\n— {{full_name}}',
  },
]

export default function CampaignsPage() {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-400 mt-0.5">4-email sequence. Edit and save changes.</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Save size={15} />
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Placeholders:</strong> {'{{first_name}}'}, {'{{business_name}}'}, {'{{monthly_price}}'},
        {'{{full_name}}'}, {'{{phone}}'}, {'{{booking_link}}'}, {'{{demo_link}}'}
        — all pulled from Settings automatically.
      </div>

      <div className="space-y-6">
        {DEFAULT_TEMPLATES.map(t => (
          <div key={t.num} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{t.label}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                Template {t.num}
              </span>
            </div>

            {t.num === 1 && (
              <div className="mb-4 space-y-2">
                <label className="text-xs font-medium text-gray-500 block">
                  Subject A (rotates 1/3 of sends)
                </label>
                <input
                  defaultValue={t.subjectA}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-500 block">Subject B</label>
                <input
                  defaultValue={t.subjectB}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-xs font-medium text-gray-500 block">Subject C</label>
                <input
                  defaultValue={t.subjectC}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {t.num > 1 && (
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 block mb-1">Subject</label>
                <input
                  defaultValue={
                    t.num === 2
                      ? 're: {{business_name}}'
                      : t.num === 3
                      ? 'how a similar shop booked 14 extra calls last month'
                      : 'closing the loop on {{business_name}}'
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <label className="text-xs font-medium text-gray-500 block mb-1">Body</label>
            <textarea
              defaultValue={t.body}
              rows={t.num === 1 ? 14 : 8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
