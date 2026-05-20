"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "D" },
  { href: "/projects", label: "Projects", icon: "P" },
  { href: "/tasks", label: "Tasks", icon: "T" },
  { href: "/board", label: "Board", icon: "B" },
  { href: "/activity", label: "Activity", icon: "A" },
  { href: "/settings", label: "Settings", icon: "S" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; image?: string; role: string } | null>(null)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res.data?.user) {
        setUser({
          name: res.data.user.name,
          email: res.data.user.email,
          image: res.data.user.image || undefined,
          role: (res.data.user as any).role || "reviewer",
        })
      }
    })
  }, [])

  const handleLogout = async () => {
    await authClient.signOut()
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-slate-100 px-4", collapsed && "justify-center")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          {!collapsed && <span className="font-bold text-slate-900 text-sm tracking-tight">AI Ops</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                collapsed && "justify-center px-2"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {item.icon}
              </div>
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className={cn("border-t border-slate-100 px-3 py-3", collapsed && "flex justify-center")}>
        {user && (
          <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{user.role}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="Sign out">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors z-50"
      >
        <svg className={cn("w-3 h-3 transition-transform", collapsed && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  )
}
