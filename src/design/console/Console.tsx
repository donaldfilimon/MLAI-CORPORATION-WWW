/* MLAI — Console UI Kit.
   Self-contained typed React module converted from the in-browser Babel
   prototype (design/ui-kits/console). Renders the full console: a Shell
   (sidebar + topbar + ⌘K palette) wrapping Chat / Telemetry / Views.

   Kit-specific CSS that is not already in src/index.css (cnPing keyframes,
   the ambient page light, sidebar collapse + reduced-motion) is inlined once
   here via a module-scoped <style>. Shared tokens/classes (.glass, surfaces,
   .eyebrow, fonts, --hair-strong) live in src/index.css and are reused. */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CmdPalette, Sidebar, Topbar, TITLES, type Route } from "./Shell.tsx";
import { Chat } from "./Chat.tsx";
import { Telemetry } from "./Telemetry.tsx";
import { Memory, Overview, Settings } from "./Views.tsx";

const KIT_CSS = `
.cn-root { height: 100%; }
.cn-root ::selection { background: rgba(59,130,246,0.3); }
@keyframes cnPing { 75%, 100% { transform: scale(2); opacity: 0; } }
/* ambient page light — declared once at the console root */
.cn-light {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(50% 40% at 60% -6%, rgba(34,211,238,0.10), transparent 70%),
    radial-gradient(40% 50% at 100% 108%, rgba(168,85,247,0.10), transparent 70%);
}
@media (max-width: 760px) { .cn-sidebar { display: none !important; } }
@media (prefers-reduced-motion: reduce) { .cn-root * { animation: none !important; } }
`;

const VIEWS: Record<Route, () => ReactNode> = {
  overview: () => <Overview />,
  telemetry: () => <Telemetry />,
  personas: () => <Chat />,
  memory: () => <Memory />,
  settings: () => <Settings />,
};

export default function Console() {
  const [route, setRoute] = useState<Route>("overview");
  const [cmd, setCmd] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  // personas chat needs to fill height; other views scroll
  const fill = route === "personas";
  const view = VIEWS[route]();

  const titleStyle: CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "var(--text-h3)",
    letterSpacing: "-0.01em",
    color: "var(--text)",
    margin: "0 0 20px",
  };

  return (
    <div className="cn-root" style={{ display: "flex", height: "100vh", position: "relative" }}>
      <style>{KIT_CSS}</style>
      <div className="cn-light" />
      <Sidebar route={route} setRoute={setRoute} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative" }}>
        <Topbar route={route} onCmd={() => setCmd(true)} />
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: fill ? "hidden" : "auto",
            padding: fill ? 24 : "28px 32px",
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              height: fill ? "100%" : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1 style={titleStyle}>{TITLES[route]}</h1>
            <div style={{ flex: fill ? 1 : "none", minHeight: 0 }}>{view}</div>
          </div>
        </main>
      </div>
      <CmdPalette open={cmd} onClose={() => setCmd(false)} setRoute={setRoute} />
    </div>
  );
}
