"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ className, label, error, id, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            "pr-8",
            error && "border-rose-300 focus:ring-rose-400",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  )
}
