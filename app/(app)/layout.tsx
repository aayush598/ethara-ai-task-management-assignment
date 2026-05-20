"use client"

import { Sidebar } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideSidebar = pathname === "/login" || pathname === "/register" || pathname === "/"

  if (hideSidebar) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="pl-56 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-8 animate-[fade-up_0.3s_ease_both]">
          {children}
        </div>
      </main>
    </div>
  )
}
