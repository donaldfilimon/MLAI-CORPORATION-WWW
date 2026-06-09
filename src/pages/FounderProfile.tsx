import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Globe, MapPin } from "lucide-react";
import { Button, Card, Separator } from "@/components/ui";
import { content } from "@/data";
import { useUI } from "@/lib/ui-context";
import { ArticleSections } from "@/components/article";

/** Profile portrait with a graceful initials fallback if the image fails. */
function ProfilePhoto({ name, image }: { name: string; image: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10">
      {failed ? (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500/25 to-teal-500/10"
          aria-label={name}
        >
          <span className="font-display text-5xl font-bold text-emerald-200/80">
            {initials}
          </span>
        </div>
      ) : (
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent" />
    </div>
  );
}

/** GitHub glyph (not exported by this lucide version). */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

/** X / Twitter glyph (not in lucide). */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FounderProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { openInquiry } = useUI();

  const member = content.team.find((m) => m.slug === slug);

  if (!member) {
    return (
      <div className="container-custom pt-32 pb-20 min-h-screen font-sans" role="main">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
            404 — Profile not found
          </span>
          <h1 className="mt-4 text-3xl font-display font-bold text-white">
            That profile doesn&apos;t exist.
          </h1>
          <Link
            to="/team"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back to leadership
          </Link>
        </div>
      </div>
    );
  }

  const socials = member.socials ?? {};

  return (
    <article
      className="container-custom pt-32 pb-24 min-h-screen font-sans overflow-hidden"
      role="main"
      aria-labelledby="founder-heading"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-dim hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Leadership
        </Link>

        {/* Hero */}
        <div className="grid gap-10 md:grid-cols-[300px_1fr] md:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:sticky md:top-28"
          >
            <ProfilePhoto name={member.name} image={member.image} />

            {(socials.github || socials.x || socials.web) && (
              <div className="mt-5 flex items-center gap-2">
                {socials.github && (
                  <a
                    href={`https://github.com/${socials.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on GitHub`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-dim transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}
                {socials.x && (
                  <a
                    href={`https://x.com/${socials.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on X`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-dim transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </a>
                )}
                {socials.web && (
                  <a
                    href={`https://${socials.web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} website`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-dim transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em] mb-4">
              {member.role}
            </div>
            <h1
              id="founder-heading"
              className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-[1.1] mb-5"
            >
              {member.name}
            </h1>
            {member.tagline && (
              <p className="text-lg md:text-xl text-text-dim leading-relaxed mb-5">
                {member.tagline}
              </p>
            )}
            {member.location && (
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-dim/60 mb-6">
                <MapPin className="h-3 w-3" /> {member.location}
              </div>
            )}
            <p className="text-base md:text-lg text-text-dim leading-relaxed">
              {member.bio}
            </p>
          </motion.header>
        </div>

        {/* Focus areas */}
        {member.focusAreas && member.focusAreas.length > 0 && (
          <section className="mt-20" aria-labelledby="focus-heading">
            <h2
              id="focus-heading"
              className="text-2xl font-display font-bold text-white mb-8"
            >
              Focus areas
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {member.focusAreas.map((area) => (
                <Card key={area.title} variant="glass" className="p-6">
                  <h3 className="text-base font-bold text-white mb-2">
                    {area.title}
                  </h3>
                  <p className="text-sm text-text-dim leading-relaxed">
                    {area.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Signature projects */}
        {member.projects && member.projects.length > 0 && (
          <section className="mt-20" aria-labelledby="projects-heading">
            <h2
              id="projects-heading"
              className="text-2xl font-display font-bold text-white mb-8"
            >
              Signature work
            </h2>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2">
              {member.projects.map((project) => {
                const inner = (
                  <div className="group flex h-full flex-col bg-bg p-6 transition-colors hover:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-mono text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {project.name}
                      </span>
                      <span className="flex items-center gap-2">
                        {project.lang && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-text-dim/50">
                            {project.lang}
                          </span>
                        )}
                        {project.url && (
                          <ArrowUpRight className="h-3.5 w-3.5 text-text-dim/50 group-hover:text-emerald-400 transition-colors" />
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-text-dim leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                );
                return project.url ? (
                  <a
                    key={project.name}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={project.name}>{inner}</div>
                );
              })}
            </div>
          </section>
        )}

        {/* Long-form sections */}
        {member.body && member.body.length > 0 && (
          <div className="mt-20 max-w-3xl">
            <ArticleSections body={member.body} />
          </div>
        )}

        <Separator className="my-14 bg-white/10" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-text-dim/50 mb-2">
              Building something aligned?
            </p>
            <Button
              type="button"
              onClick={openInquiry}
              className="font-bold uppercase tracking-widest text-xs"
            >
              Start an inquiry
            </Button>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> All leadership
          </Link>
        </div>
      </div>
    </article>
  );
}
