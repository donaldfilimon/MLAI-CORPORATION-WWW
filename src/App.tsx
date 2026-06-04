import { lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Toaster } from "./components/ui/toaster";
import { RouteMetadata } from "./components/RouteMetadata";

// Lazy load pages
const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About })),
);
const Services = lazy(() =>
  import("./pages/Services").then((module) => ({ default: module.Services })),
);
const Research = lazy(() =>
  import("./pages/Research").then((module) => ({ default: module.Research })),
);
const Team = lazy(() =>
  import("./pages/Team").then((module) => ({ default: module.Team })),
);
const Blog = lazy(() =>
  import("./pages/Blog").then((module) => ({ default: module.Blog })),
);
const Docs = lazy(() =>
  import("./pages/Docs").then((module) => ({ default: module.Docs })),
);
const Login = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.Login })),
);
const Console = lazy(() =>
  import("./pages/Console").then((module) => ({ default: module.Console })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((module) => ({ default: module.Profile })),
);
const Benchmarks = lazy(() =>
  import("./pages/Benchmarks").then((module) => ({
    default: module.Benchmarks,
  })),
);
const Privacy = lazy(() =>
  import("./pages/Privacy").then((module) => ({ default: module.Privacy })),
);
const Terms = lazy(() =>
  import("./pages/Terms").then((module) => ({ default: module.Terms })),
);
const Security = lazy(() =>
  import("./pages/Security").then((module) => ({ default: module.Security })),
);
const TFPoseDemo = lazy(() => import("./pages/TFPoseDemo"));

function App() {
  return (
    <ErrorBoundary>
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MLAI Corporation",
          url: "https://mlai-corp.com",
          logo: "https://mlai-corp.com/logo.png",
          description:
            "Leading AI and ML research lab providing high-integrity frameworks for neural AI orchestration.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Palo Alto",
            addressRegion: "CA",
            addressCountry: "US",
          },
        })}
      </script>

      <Router>
        <RouteMetadata />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="about"
              element={
                <div className="pt-10">
                  <About />
                </div>
              }
            />
            <Route
              path="research"
              element={
                <div className="pt-10">
                  <Research />
                </div>
              }
            />
            <Route
              path="services"
              element={
                <div className="pt-10">
                  <Services />
                </div>
              }
            />
            <Route
              path="team"
              element={
                <div className="pt-10">
                  <Team />
                </div>
              }
            />
            <Route path="blog" element={<Blog />} />
            <Route path="docs" element={<Docs />} />
            <Route path="benchmarks" element={<Benchmarks />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Login />} />
            <Route path="console" element={<Console />} />
            <Route path="profile" element={<Profile />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="security" element={<Security />} />
            <Route path="tf-pose-demo" element={<TFPoseDemo />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
