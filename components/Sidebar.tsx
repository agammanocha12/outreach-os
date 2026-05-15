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
    <aside className="w-56 bg-gray-900 text-white flex flex-col min-h-screen shrink-0">
      <div className="p-5 border-b border-gray-700">
        <h1 className="font-bold text-base">Outreach OS</h1>
        <p className="text-xs text-gray-400 mt-0.5">Atlas Reception</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {label === 'Inbox' && unread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">atlasreception4you@gmail.com</p>
      </div>
    </aside>
  )
}
