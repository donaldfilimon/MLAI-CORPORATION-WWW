export interface CloudKitPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  getAccountStatus(): Promise<{ status: string }>;
}

export declare const CloudKit: CloudKitPlugin;
