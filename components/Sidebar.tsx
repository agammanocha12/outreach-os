'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Inbox, Megaphone, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const d = await res.json()
          setUnread(d.unhandledReplies ?? 0)
        }
      } catch {}
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className="w-52 flex flex-col min-h-screen shrink-0 bg-[#1d1d1f]">
      <div className="px-5 pt-7 pb-6">
        <div className="text-white font-semibold text-[15px] tracking-tight">Outreach OS</div>
        <div className="text-[#6e6e73] text-xs mt-0.5">Atlas Reception</div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#98989d] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
              {label === 'Inbox' && unread > 0 && (
                <span className="ml-auto bg-[#ff3b30] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-5 border-t border-white/[0.06]">
        <p className="text-[11px] text-[#48484a] truncate">atlasreception4you@gmail.com</p>
      </div>
    </aside>
  )
}
