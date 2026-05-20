"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-slate-200 shadow-[0_32px_80px_rgba(15,23,42,0.14)] max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto",
          "animate-[fade-up_0.2s_ease_both]",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5 border-b border-slate-100", className)}>{children}</div>
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3", className)}>{children}</div>
}
