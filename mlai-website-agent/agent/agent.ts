import { defineAgent, defineDynamic } from "eve";

export default defineAgent({
  defaultTools: false,
  model: defineDynamic({
    events: {
      "step.started": () => {
        throw new Error(
          "Standalone MLAI agent model access is disabled. Model selection must come from an authenticated MLAI workspace and preserve its hosted-consent decision.",
        );
      },
    },
  }),
});
