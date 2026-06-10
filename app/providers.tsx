"use client";

/**
 * Client provider stack + page chrome — the App Router equivalent of the old
 * main.tsx provider nesting and Layout.tsx shell (Navbar/Footer/skip link/
 * ambient decorations). Everything below this boundary is a client component,
 * which is how the ported SPA pages keep using hooks unchanged.
 */

import { useState, type ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { UIProvider } from "@/lib/ui-context";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      }),
  );

  return (
    <LazyMotion features={domAnimation}>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <div className="min-h-screen bg-bg text-text selection:bg-primary/20 flex flex-col">
            <ScrollToTop />
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-primary text-white px-4 py-2 rounded-md font-medium shadow-xl outline-none ring-2 ring-white"
            >
              Skip to main content
            </a>

            <Navbar />

            <main id="main-content" tabIndex={-1} className="outline-none flex-grow mt-24">
              {children}
            </main>

            <Footer />

            {/* Global UI Decorations */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-500/[0.03] to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-indigo-500/[0.03] to-transparent" />
            </div>
          </div>
          <Toaster />
        </UIProvider>
      </AuthProvider>
      </QueryClientProvider>
    </LazyMotion>
  );
}
