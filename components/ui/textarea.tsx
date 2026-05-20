import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ className, label, error, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200 resize-y",
          error && "border-rose-300 focus:ring-rose-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  )
}
