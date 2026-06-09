import { TeamSchema, type Team } from '../schemas';

export const team: Team = TeamSchema.parse([
  {
    name: "Donald Filimon",
    role: "Founder & Systems Architect",
    bio: "Builds privacy-first AI infrastructure, developer tools, and high-performance systems across Swift, Zig, TypeScript, and GPU-oriented runtimes.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    name: "Maya Ionescu",
    role: "Research Systems Lead",
    bio: "Focuses on retrieval quality, benchmark design, source provenance, and converting experimental ideas into maintainable runtime services.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    name: "Noah Kim",
    role: "Safety Engineering Lead",
    bio: "Designs policy gates, adversarial test suites, and observability workflows for systems that combine LLMs with external tools.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    name: "Elena Rodriguez",
    role: "Runtime Engineering Lead",
    bio: "Works on low-latency orchestration, GPU-aware workloads, distributed evaluation, and service reliability for AI infrastructure.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    name: "James Okonkwo",
    role: "Applied Research Lead",
    bio: "Leads studies on interpretability, hallucination measurement, data governance, and operator-facing confidence signals.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400"
  },
  {
    name: "Sophia Varma",
    role: "Product Architecture Lead",
    bio: "Shapes developer experience, integration patterns, and calm control surfaces for complex AI systems used by operational teams.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400&h=400"
  }
]);
