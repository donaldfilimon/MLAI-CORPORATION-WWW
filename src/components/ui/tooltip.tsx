import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

function TooltipTrigger({
  asChild = false,
  ...props
}: TooltipPrimitive.Trigger.Props & { asChild?: boolean }) {
  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      ...props,
      className: cn(child.props.className, (props as any).className),
    } as any)
  }
  return <TooltipPrimitive.Trigger {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  side = "top",
  ...props
}: TooltipPrimitive.Popup.Props & { sideOffset?: number; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
