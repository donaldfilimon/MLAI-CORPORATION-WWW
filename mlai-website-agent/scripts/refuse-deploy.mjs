console.error(
  [
    "MLAI website agent is not deployable.",
    "Keep this scaffold local until it is mounted behind the MLAI application and inherits application-owned session, workspace, durable-session, model-consent, and privacy enforcement.",
    "See README.md for the required deployment evidence.",
  ].join(" "),
);
process.exitCode = 1;
