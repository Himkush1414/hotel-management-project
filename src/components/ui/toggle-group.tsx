"use client"
import * as React from "react"

interface ToggleGroupProps {
  type?: "single" | "multiple"
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children?: React.ReactNode
}

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
  children?: React.ReactNode
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, type: _type, value: _value, onValueChange: _onValueChange, ...props }, ref) => (
    <div ref={ref} className={["flex gap-1", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  )
)
ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, value: _value, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={["px-3 py-1 rounded text-sm border", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  )
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
