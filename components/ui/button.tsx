import * as React from "react"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-600 hover:to-blue-700 active:scale-[0.97]",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97]",
  outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-[0.97]",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.97]",
  danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-red-700 active:scale-[0.97]",
}

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  default: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-xl",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
