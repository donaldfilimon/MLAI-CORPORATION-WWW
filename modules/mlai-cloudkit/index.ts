import { requireOptionalNativeModule } from "expo-modules-core";
import type { MlaiCloudKitNative } from "./src/MlaiCloudKit.types";

/**
 * The native module is only present in a development/production build that
 * includes the compiled Swift. In Expo Go, on the web, or on Android it is
 * `null` — callers should branch on `isCloudKitAvailable`.
 */
const native = requireOptionalNativeModule<MlaiCloudKitNative>("MlaiCloudKit");

export const isCloudKitAvailable: boolean = native != null;

export function getCloudKit(): MlaiCloudKitNative | null {
  return native;
}

export * from "./src/MlaiCloudKit.types";
