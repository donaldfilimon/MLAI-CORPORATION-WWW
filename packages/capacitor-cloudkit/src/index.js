import { registerPlugin } from "@capacitor/core";

const web = {
  async isAvailable() {
    return { available: false };
  },
  async getAccountStatus() {
    return { status: "couldNotDetermine" };
  },
};

export const CloudKit = registerPlugin("CloudKit", { web: async () => web });
