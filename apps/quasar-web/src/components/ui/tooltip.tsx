import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Ties a `TooltipContent` to its `TooltipTrigger` for assistive tech.
 *
 * Base UI 1.6.0 wires no ARIA relationship between the two halves at all — the
 * trigger gets no `aria-describedby` and the popup gets no `role="tooltip"`
 * (verified by reading `@base-ui/react/tooltip/**`; the only `aria-*` in the
 * whole part is `aria-hidden` on the arrow). That is deliberate: its docs treat
 * a tooltip as a purely visual affordance and tell you to name the trigger
 * instead — "Tooltips are visual-only elements and are not a replacement for
 * labeling the trigger. The tooltip's trigger must have an `aria-label`
 * attribute that closely matches the tooltip's content."
 *
 * That prescription does not fit how this shim is used. `Technology.tsx`
 * triggers on an `<h3>` carrying a WDBX feature name; replacing its accessible
 * name with the tooltip prose would cost a screen-reader user the heading text
 * they navigate by. And the prose is not decorative — it is the glossary
 * definition of the term in the heading, which `cursor-help` advertises to
 * everyone while only a mouse hover could ever surface it.
 *
 * So we mint one id per `<Tooltip>` and hand it to both halves: the popup
 * becomes `role="tooltip" id={id}`, the trigger gets `aria-describedby={id}`.
 * While the tooltip is closed the popup is unmounted and the reference simply
 * dangles, which assistive tech ignores — the standard APG arrangement.
 */
const TooltipDescriptionIdContext = React.createContext<string | undefined>(
  undefined,
);

function Tooltip(props: TooltipPrimitive.Root.Props) {
  const descriptionId = React.useId();
  return (
    <TooltipDescriptionIdContext.Provider value={descriptionId}>
      <TooltipPrimitive.Root {...props} />
    </TooltipDescriptionIdContext.Provider>
  );
}

function TooltipTrigger({
  asChild = false,
  className,
  children,
  ...props
}: TooltipPrimitive.Trigger.Props & { asChild?: boolean; className?: string }) {
  const describedBy = React.useContext(TooltipDescriptionIdContext);

  if (asChild && React.isValidElement(children)) {
    /*
     * `asChild` used to be a bare `React.cloneElement(children, props)`, which
     * silently dropped everything that makes a tooltip usable: `props` is empty
     * at the call sites, so `TooltipPrimitive.Trigger` never rendered at all and
     * the cloned element received no hover/focus handlers, no ref, and no id.
     *
     * Base UI's equivalent of `asChild` is the `render` prop that every part
     * inherits from `BaseUIComponentProps`. Passing the child element there
     * routes it through `useRenderElement`, which merges via
     * `mergeProps(generatedProps, render.props)` — event handlers chain,
     * classNames concatenate, the child's own props keep precedence — and
     * composes refs with `useMergedRefs`, so the trigger registers with the
     * tooltip store the way a plain `Trigger` does.
     */
    return (
      <TooltipPrimitive.Trigger
        render={children}
        className={className}
        /*
         * Base UI's TooltipTrigger defaults to a `<button>`, but a `render`
         * target is whatever the call site passed — a heading, a lucide `<svg>`
         * — and neither is focusable, so the `useFocus` handlers it attaches
         * would never fire. Nothing here can safely add a `role` to compensate:
         * `role="button"` would suit a bare glyph and would destroy the heading
         * semantics in `Technology.tsx`. Focusability alone unlocks the content.
         *
         * Declared before `{...props}` (and outranked by the child's own props
         * under Base UI's merge order) so a call site can still override it.
         */
        tabIndex={0}
        aria-describedby={describedBy}
        {...props}
      />
    );
  }
  return (
    <TooltipPrimitive.Trigger
      className={className}
      aria-describedby={describedBy}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipContent({
  className,
  sideOffset = 4,
  side = "top",
  ...props
}: TooltipPrimitive.Popup.Props & {
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
}) {
  const descriptionId = React.useContext(TooltipDescriptionIdContext);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          // The other half of the link described on TooltipDescriptionIdContext.
          id={descriptionId}
          role="tooltip"
          className={cn(
            "z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
