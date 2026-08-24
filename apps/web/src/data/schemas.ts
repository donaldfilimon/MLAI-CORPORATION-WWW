import { z } from 'zod';

/** A titled prose card — the shape shared by `about.values` and `about.investorThesis`. */
const CardSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/** Key/value rows rendered by `site/SpecList` — configuration facts, never measurements. */
const SpecRowsSchema = z.array(z.object({
  k: z.string(),
  v: z.string(),
}));

/**
 * The `site/` **product** accent axis (wdbx cyan · abi violet · abbey emerald).
 * Distinct from the persona enum used by `ProductsSchema` below — the product
 * "abi" is violet while the persona "Abi" is cyan. See `src/components/site/accent.ts`.
 */
const SiteAccentSchema = z.enum(['wdbx', 'abi', 'abbey']);

/** Eyebrow/title/lead copy for a sub-section — kept in data so views hold no content. */
const SectionChromeSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  lead: z.string(),
});

export const AboutSchema = z.object({
  values: z.array(CardSchema),
  operatingPrinciples: z.array(z.string()),
  /** Registration-level facts (SpecList rows) — ported from the design handoff's Company page. */
  companyFacts: SpecRowsSchema,
  /** Claim-free positioning cards — ported from the design handoff's Investors page. */
  investorThesis: z.array(CardSchema),
});

export const PlatformSchema = z.array(z.object({
  title: z.string(),
  description: z.string(),
  detail: z.string(),
}));

export const IndustriesSchema = z.array(z.string());

export const BlogSectionSchema = z.object({
  heading: z.string().optional(),
  paragraphs: z.array(z.string()).default([]),
  list: z.array(z.string()).optional(),
  // Optional block (display-mode) LaTeX equations, rendered via KaTeX.
  math: z.array(z.string()).optional(),
  // Optional code blocks (rendered monospace; `file` is a caption label).
  code: z
    .array(
      z.object({
        lang: z.string().optional(),
        file: z.string().optional(),
        code: z.string(),
      }),
    )
    .optional(),
});

export const ChangelogSchema = z.array(
  z.object({
    version: z.string(),
    date: z.string(),
    title: z.string(),
    items: z.array(
      z.object({
        cat: z.enum(["added", "changed", "perf", "fixed"]),
        text: z.string(),
      }),
    ),
  }),
);

export const ServicesSchema = z.array(z.object({
  title: z.string(),
  description: z.string(),
  outcomes: z.array(z.string()),
}));

export const ResearchSchema = z.object({
  tracks: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })),
  publications: z.array(z.object({
    slug: z.string(),
    tag: z.string(),
    title: z.string(),
    date: z.string(),
    abstract: z.string(),
    readTime: z.string(),
    authors: z.string().optional(),
    body: z.array(BlogSectionSchema).default([]),
  })),
});

export const BlogSchema = z.array(z.object({
  slug: z.string(),
  tag: z.string(),
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  readTime: z.string(),
  author: z.string().optional(),
  body: z.array(BlogSectionSchema).default([]),
}));

export const TeamSchema = z.array(z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  image: z.string(),
  // Optional fields that promote a member to a dedicated profile page at
  // /team/:slug. Only populated members get a "Read profile" link.
  slug: z.string().optional(),
  tagline: z.string().optional(),
  location: z.string().optional(),
  socials: z
    .object({
      github: z.string().optional(),
      x: z.string().optional(),
      web: z.string().optional(),
    })
    .optional(),
  focusAreas: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().optional(),
        lang: z.string().optional(),
      }),
    )
    .optional(),
  body: z.array(BlogSectionSchema).optional(),
}));

export const StatsSchema = z.array(z.object({
  value: z.string(),
  label: z.string(),
  detail: z.string(),
}));

export const FAQSchema = z.array(z.object({
  question: z.string(),
  answer: z.string(),
}));

// Product deep-dive pages (/products/:slug) — structured narrative content
// ported from the MLAI mega-site. Equations are LaTeX (KaTeX block render);
// accents bind to the persona palette already used by the Docs persona dots.
export const ProductsSchema = z.array(z.object({
  slug: z.string(),
  kicker: z.string(),
  name: z.string(),
  intro: z.string(),
  accent: z.enum(['abbey', 'aviva', 'abi']),
  sections: z.array(z.object({
    eyebrow: z.string(),
    title: z.string(),
    sub: z.string().optional(),
    paragraphs: z.array(z.string()).default([]),
    equations: z.array(z.object({ tex: z.string(), note: z.string() })).optional(),
    pillars: z.array(z.object({
      title: z.string(),
      description: z.string(),
      eq: z.string().optional(),
      accent: z.enum(['abbey', 'aviva', 'abi']).optional(),
    })).optional(),
    steps: z.array(z.object({ n: z.string(), title: z.string(), description: z.string() })).optional(),
    blendTable: z.array(z.object({ range: z.string(), meaning: z.string(), accent: z.enum(['abbey', 'aviva', 'abi']) })).optional(),
    demo: z.enum(['persona-router', 'cosine-sim', 'sharding-latency']).optional(),
    chips: z.array(z.string()).optional(),
  })),
}));

/** "What we say no to" — refusal callouts on the Services page. */
export const RefusalsSchema = z.array(z.object({
  label: z.string(),
  accent: SiteAccentSchema,
  body: z.string(),
}));

/**
 * The Home "runtime underneath" block: the L6→L1 layer stack and the
 * memory-model spec, each with its section chrome. Architecture facts only —
 * every row is corroborated against the mirrored docs in `public/docs/wdbx/`;
 * no figures, so no provenance tags.
 */
export const RuntimeSchema = z.object({
  section: SectionChromeSchema,
  layers: z.array(z.object({
    /** Tier label, L6 (surface) down to L1 (audit). Rendered as the mono meta line. */
    tier: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  memorySection: SectionChromeSchema,
  memoryModel: SpecRowsSchema,
});

export const ContentSchema = z.object({
  about: AboutSchema,
  platform: PlatformSchema,
  industries: IndustriesSchema,
  services: ServicesSchema,
  refusals: RefusalsSchema,
  runtime: RuntimeSchema,
  research: ResearchSchema,
  blog: BlogSchema,
  team: TeamSchema,
  stats: StatsSchema,
  faq: FAQSchema,
  products: ProductsSchema,
  changelog: ChangelogSchema,
});

export type About = z.infer<typeof AboutSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Industries = z.infer<typeof IndustriesSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type Refusals = z.infer<typeof RefusalsSchema>;
export type Runtime = z.infer<typeof RuntimeSchema>;
export type Research = z.infer<typeof ResearchSchema>;
export type Blog = z.infer<typeof BlogSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Products = z.infer<typeof ProductsSchema>;
export type Changelog = z.infer<typeof ChangelogSchema>;
export type Content = z.infer<typeof ContentSchema>;
