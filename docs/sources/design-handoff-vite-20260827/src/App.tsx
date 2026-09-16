import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RouteChrome } from "./components/RouteChrome";

const Home = lazy(() => import("./pages/Home"));
const Wdbx = lazy(() => import("./pages/Wdbx"));
const Abi = lazy(() => import("./pages/Abi"));
const Abbey = lazy(() => import("./pages/Abbey"));
const Research = lazy(() => import("./pages/Research"));
const Company = lazy(() => import("./pages/Company"));
const Platform = lazy(() => import("./pages/Platform"));
const Services = lazy(() => import("./pages/Services"));
const Architecture = lazy(() => import("./pages/Architecture"));
const Investors = lazy(() => import("./pages/Investors"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      style={{
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-jbm), ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#475569",
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <>
      <a className="mlai-skip" href="#main">Skip to content</a>
      <RouteChrome />
      <main id="main" className="mlai-main">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wdbx" element={<Wdbx />} />
            <Route path="/abi" element={<Abi />} />
            <Route path="/abbey" element={<Abbey />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/services" element={<Services />} />
            <Route path="/research" element={<Research />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/company" element={<Company />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
