import { BlogSchema, type Blog } from '../schemas';

export const blog: Blog = BlogSchema.parse([
  {
    tag: "FIELD NOTE",
    title: "Designing AI Systems That Can Explain Their Last Move",
    excerpt: "A practical guide to capturing retrieval paths, policy checks, and operator decisions so teams can debug autonomous workflows after the fact.",
    date: "May 21, 2026",
    readTime: "7 min read"
  },
  {
    tag: "ENGINEERING",
    title: "What We Measure Before Calling an Agent Production-Ready",
    excerpt: "Latency and accuracy are not enough. We track tool-boundary violations, source coverage, rollback paths, abstention quality, and human-review burden.",
    date: "May 18, 2026",
    readTime: "9 min read"
  },
  {
    tag: "RESEARCH",
    title: "From Vector Search to Weighted Backtrace Graphs",
    excerpt: "Why retrieval infrastructure needs relationship-aware context and why ranking alone is not sufficient for high-stakes answer generation.",
    date: "May 12, 2026",
    readTime: "12 min read"
  },
  {
    tag: "SAFETY",
    title: "The Case for Separate Planning, Review, and Execution Agents",
    excerpt: "Role separation lets teams encode checks and balances into an AI workflow instead of relying on a single agent to police itself.",
    date: "May 8, 2026",
    readTime: "8 min read"
  },
  {
    tag: "PRODUCT",
    title: "Making AI Control Surfaces Feel Calm Under Pressure",
    excerpt: "Interface details that prevent overload: progressive disclosure, confidence bands, decision diffs, and emergency stop affordances.",
    date: "April 29, 2026",
    readTime: "6 min read"
  },
  {
    tag: "OPERATIONS",
    title: "What Incident Reviews Need From AI Logs",
    excerpt: "How to structure traces so teams can reconstruct context, model output, policy decisions, tool calls, and human overrides after a production event.",
    date: "April 18, 2026",
    readTime: "10 min read"
  },
  {
    tag: "DEPLOYMENT",
    title: "Private AI Does Not Mean Invisible AI",
    excerpt: "Offline and VPC deployments still need measurable controls: local audit trails, release gates, repeatable evals, and operator-visible confidence signals.",
    date: "April 11, 2026",
    readTime: "8 min read"
  }
]);
