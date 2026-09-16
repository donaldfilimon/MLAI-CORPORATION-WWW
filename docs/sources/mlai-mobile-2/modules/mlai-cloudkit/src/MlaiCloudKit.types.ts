export type CloudAccountStatus =
  | "available"
  | "noAccount"
  | "restricted"
  | "couldNotDetermine"
  | "temporarilyUnavailable";

/** A raw CloudKit record as returned by the native bridge. */
export type CloudRecord = {
  recordName: string;
  recordType: string;
  [field: string]: string | number;
};

export type CloudFields = Record<string, string | number | boolean>;

export interface MlaiCloudKitNative {
  getAccountStatus(): Promise<CloudAccountStatus>;
  save(recordType: string, recordName: string | null, fields: CloudFields): Promise<CloudRecord>;
  query(recordType: string, limit: number): Promise<CloudRecord[]>;
  remove(recordName: string): Promise<string>;
}
