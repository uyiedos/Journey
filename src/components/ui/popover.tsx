"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Minimal internal popover implementation to avoid external Radix dependency.
// Currently used only as a type-safe wrapper; behavior is intentionally simple.

interface PopoverProps {
  children: React.ReactNode
}

const Popover: React.FC<PopoverProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    // When used with `asChild`, the parent usually wraps the trigger; for now we
    // just render a button for simplicity.
    return (
      <button ref={ref} className={cn(className)} {...props}>
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-2 w-72 rounded-md border bg-white p-4 text-sm shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
