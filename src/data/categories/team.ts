import { TeamSchema, type Team } from '../schemas';

export const team: Team = TeamSchema.parse([
  {
    name: "Donald Filimon",
    role: "Founder & Systems Architect",
    bio: "Builds privacy-first AI infrastructure, developer tools, and high-performance systems across Swift, Zig, TypeScript, and GPU-oriented runtimes. Leads WDBX retrieval, the Abbey–Aviva–Abi orchestration framework, and the ABI runtime.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400"
  }
]);
