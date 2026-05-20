import { cn } from "@/lib/utils"

const variants = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
}

interface BadgeProps {
  children: React.ReactNode
  variant?: keyof typeof variants
  className?: string
}

export function Badge({ children, variant = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
