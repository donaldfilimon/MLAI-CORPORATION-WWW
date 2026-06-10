import { z } from 'zod';

export const AboutSchema = z.object({
  values: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  operatingPrinciples: z.array(z.string()),
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
});

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

export const ContentSchema = z.object({
  about: AboutSchema,
  platform: PlatformSchema,
  industries: IndustriesSchema,
  services: ServicesSchema,
  research: ResearchSchema,
  blog: BlogSchema,
  team: TeamSchema,
  stats: StatsSchema,
  faq: FAQSchema,
  products: ProductsSchema,
});

export type About = z.infer<typeof AboutSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Industries = z.infer<typeof IndustriesSchema>;
export type Services = z.infer<typeof ServicesSchema>;
export type Research = z.infer<typeof ResearchSchema>;
export type Blog = z.infer<typeof BlogSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Products = z.infer<typeof ProductsSchema>;
export type Content = z.infer<typeof ContentSchema>;
