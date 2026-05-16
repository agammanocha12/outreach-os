'use client'
import { useState } from 'react'
import { Save } from 'lucide-react'

const DEFAULT_TEMPLATES = [
  {
    num: 1,
    label: 'Email 1 — Initial outreach',
    timing: 'Day 1',
    subjectA: "calls you're missing at {{business_name}}?",
    subjectB: 'missed emergency calls at {{business_name}}?',
    subjectC: '{{first_name}} — quick {{business_name}} question',
    body: "Hey {{first_name}},\n\nQuick math for {{business_name}}: HVAC/plumbing shops typically miss 3-7 calls a day — while techs are on jobs, after 5pm, or during peak season. At $300-1,500 per service call, that's $1,000-7,000 a week going to whoever picks up first.\n\nI built an AI receptionist specifically for HVAC and plumbing. Answers every call 24/7, qualifies the emergency level, books straight into your scheduler (Jobber, Housecall Pro, ServiceTitan, or Google Calendar), and texts you the details. Sounds 100% human.\n\n${{monthly_price}}/mo flat, no contract. Works on your existing number in 10 minutes.\n\nWorth a quick listen?\n\n— {{full_name}}\n{{phone}}\n{{business_name}}\n{{physical_address}}\n\nReply STOP to unsubscribe.",
  },
  {
    num: 2,
    label: 'Email 2 — Bump',
    timing: 'Day 3',
    body: "Hey {{first_name}} — bumping this.\n\nEven one extra service call this week pays for the AI receptionist for 3+ months.\n\nWorth a 60-sec listen?\n\n— {{full_name}}",
  },
  {
    num: 3,
    label: 'Email 3 — Case study',
    timing: 'Day 7',
    body: "{{first_name}},\n\nReal example — a 4-tech HVAC shop ran us for 30 days:\n\n→ 47 calls answered after hours/weekends (all would've been missed)\n→ 14 turned into booked service jobs\n→ $6,200 in new revenue\n→ ${{monthly_price}} cost = 31x return\n\nSame setup for {{business_name}} this week. 10-min install on your existing number.\n\n10-min Zoom to see it live? {{booking_link}}\n\n— {{full_name}}\n{{phone}}",
  },
  {
    num: 4,
    label: 'Email 4 — Breakup',
    timing: 'Day 14',
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
    <div className="p-8 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Campaigns</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">4-email drip sequence</p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: '#0071e3' }}
        >
          <Save size={14} />
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>

      <div className="bg-[#e8f0fe] rounded-2xl p-4 text-[13px] text-[#0055b3] leading-relaxed">
        <span className="font-semibold">Placeholders: </span>
        {'{{first_name}}'}, {'{{business_name}}'}, {'{{monthly_price}}'},
        {'{{full_name}}'}, {'{{phone}}'}, {'{{booking_link}}'}, {'{{demo_link}}'}
        — all pulled from Settings automatically.
      </div>

      <div className="space-y-4">
        {DEFAULT_TEMPLATES.map(t => (
          <div key={t.num} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e0e0e5]/60 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f5]">
              <div>
                <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{t.label}</h3>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                {t.timing}
              </span>
            </div>

            <div className="p-6 space-y-4">
              {t.num === 1 && (
                <div className="space-y-3">
                  {[
                    { label: 'Subject A (⅓ of sends)', value: t.subjectA },
                    { label: 'Subject B', value: t.subjectB },
                    { label: 'Subject C', value: t.subjectC },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">{label}</label>
                      <input
                        defaultValue={value}
                        className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {t.num > 1 && (
                <div>
                  <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Subject</label>
                  <input
                    defaultValue={
                      t.num === 2 ? 're: {{business_name}}'
                      : t.num === 3 ? 'how a similar shop booked 14 extra calls last month'
                      : 'closing the loop on {{business_name}}'
                    }
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] bg-[#f5f5f7] border-0 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-[#86868b] uppercase tracking-wide block mb-1.5">Body</label>
                <textarea
                  defaultValue={t.body}
                  rows={t.num === 1 ? 13 : 7}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] font-mono bg-[#f5f5f7] border-0 resize-none focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 text-[#1d1d1f] leading-relaxed"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
