// Metro configuration for the root Bun workspace. The isolated linker places
// real package files under <repo>/node_modules/.bun and exposes them to this
// app through symlinks, and `@mlai/contracts` is a workspace symlink into
// <repo>/packages. Metro must therefore watch the repository root and follow
// symlinks, and must honor package "exports" maps.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [...new Set([...(config.watchFolders ?? []), workspaceRoot])];
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
