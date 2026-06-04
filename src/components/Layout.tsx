import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";

export function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/30 flex flex-col">
      <ScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-primary text-white px-4 py-2 rounded-md font-medium shadow-xl outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="outline-none flex-grow mt-24"
      >
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center text-text-dim">
              Loading content...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <Footer />

      {/* Global UI Decorations */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-blue-500/5 to-transparent" />
      </div>
    </div>
  );
}
