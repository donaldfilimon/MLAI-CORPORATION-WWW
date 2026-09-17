// Next 16's `next dev` writes AGENTS.md/CLAUDE.md pointing at
// node_modules/next/dist/docs, which Quasar's path guard never lets the model
// read. Opt out so previews do not add those files to generated sites.
export default { agentRules: false };
