"use client";

import Script from "next/script";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

type TurnstileWidgetId = string;

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "dark";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = { reset: () => void };

export const TurnstileWidget = forwardRef<
  TurnstileWidgetHandle,
  { action: string; onTokenChange: (token: string) => void }
>(function TurnstileWidget({ action, onTokenChange }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<TurnstileWidgetId | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  const renderWidget = useCallback(() => {
    if (!siteKey || !container.current || widgetId.current !== null || !window.turnstile) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action,
      theme: "dark",
      callback: onTokenChange,
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
    });
  }, [action, onTokenChange, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [renderWidget]);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current !== null && window.turnstile) window.turnstile.reset(widgetId.current);
      onTokenChange("");
    },
  }), [onTokenChange]);

  if (!siteKey) {
    return <p role="alert" className="text-center text-xs text-amber-300">Verification is not configured.</p>;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={container} className="flex min-h-[65px] justify-center" aria-label="Human verification" />
    </>
  );
});
