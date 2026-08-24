/**
 * withCloudKit — Expo config plugin.
 *
 * Adds the iCloud + CloudKit entitlements and the container identifier to the
 * native iOS project at prebuild time, so the app can talk to the user's
 * private CloudKit database. Pair with `ios.usesAppleSignIn: true` (set in
 * app.json) for Sign in with Apple.
 *
 * Container id convention: iCloud.<bundleIdentifier>.
 */
const { withEntitlementsPlist, withInfoPlist } = require("@expo/config-plugins");

const CONTAINER = "iCloud.dev.mlai.mobile";

const withCloudKit = (config) => {
  // Entitlements
  config = withEntitlementsPlist(config, (cfg) => {
    const e = cfg.modResults;
    e["com.apple.developer.icloud-container-identifiers"] = [CONTAINER];
    e["com.apple.developer.icloud-services"] = ["CloudKit"];
    e["com.apple.developer.ubiquity-container-identifiers"] = [CONTAINER];
    // Remote notifications drive CloudKit subscription delivery (optional, future).
    e["aps-environment"] = e["aps-environment"] || "development";
    return cfg;
  });

  // Info.plist — declare the remote-notification background mode for CloudKit
  // subscription pushes (harmless if subscriptions aren't used yet).
  config = withInfoPlist(config, (cfg) => {
    const info = cfg.modResults;
    const modes = new Set(info.UIBackgroundModes || []);
    modes.add("remote-notification");
    info.UIBackgroundModes = Array.from(modes);
    return cfg;
  });

  return config;
};

module.exports = withCloudKit;
