import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 text-left",
        hover && "hover:shadow-[0_8px_32px_rgba(79,70,229,0.08)] hover:border-indigo-200",
        onClick && "cursor-pointer w-full active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5 border-b border-slate-100", className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>
}
