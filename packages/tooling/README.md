# MLAI repository tooling

Repository-only checks live here so app packages do not acquire orchestration
dependencies. `check-topology.ts` verifies the documented app and shared-package
boundaries before the platform-specific gates run.
