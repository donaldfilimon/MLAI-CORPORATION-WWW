import ExpoModulesCore
import CloudKit

/**
 * MlaiCloudKit — a thin, typed bridge over the user's *private* CloudKit
 * database. The signed-in iCloud account is implicit: records live in the
 * user's own iCloud, never on an MLAI server.
 *
 * Schema (configure in the CloudKit Dashboard, Development environment):
 *   Record type: "VaultItem"
 *     - title     String
 *     - body      String
 *     - createdAt Double   (mark Sortable + Queryable to enable the query below)
 */
public class MlaiCloudKitModule: Module {
  private let container = CKContainer(identifier: "iCloud.dev.mlai.mobile")
  private var database: CKDatabase { container.privateCloudDatabase }

  public func definition() -> ModuleDefinition {
    Name("MlaiCloudKit")

    // Whether the device has a usable iCloud account.
    AsyncFunction("getAccountStatus") { (promise: Promise) in
      self.container.accountStatus { status, error in
        if let error = error {
          promise.reject("ERR_ACCOUNT", error.localizedDescription)
          return
        }
        promise.resolve(MlaiCloudKitModule.statusString(status))
      }
    }

    // Create or update a record. Pass recordName to update; nil to create.
    AsyncFunction("save") { (recordType: String, recordName: String?, fields: [String: Any], promise: Promise) in
      let recordID = recordName.map { CKRecord.ID(recordName: $0) } ?? CKRecord.ID()
      let record = CKRecord(recordType: recordType, recordID: recordID)
      for (key, value) in fields {
        if let v = MlaiCloudKitModule.ckValue(value) { record[key] = v }
      }
      self.database.save(record) { saved, error in
        if let error = error {
          promise.reject("ERR_SAVE", error.localizedDescription)
          return
        }
        promise.resolve(MlaiCloudKitModule.dictionary(from: saved))
      }
    }

    // Query a record type, newest first, up to `limit`.
    AsyncFunction("query") { (recordType: String, limit: Int, promise: Promise) in
      let query = CKQuery(recordType: recordType, predicate: NSPredicate(value: true))
      query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
      let operation = CKQueryOperation(query: query)
      operation.resultsLimit = limit

      var rows: [[String: Any]] = []
      operation.recordMatchedBlock = { _, result in
        if case .success(let record) = result {
          rows.append(MlaiCloudKitModule.dictionary(from: record))
        }
      }
      operation.queryResultBlock = { result in
        switch result {
        case .success:
          promise.resolve(rows)
        case .failure(let error):
          promise.reject("ERR_QUERY", error.localizedDescription)
        }
      }
      self.database.add(operation)
    }

    // Delete a record by name.
    AsyncFunction("remove") { (recordName: String, promise: Promise) in
      self.database.delete(withRecordID: CKRecord.ID(recordName: recordName)) { _, error in
        if let error = error {
          promise.reject("ERR_DELETE", error.localizedDescription)
          return
        }
        promise.resolve(recordName)
      }
    }
  }

  // MARK: - Helpers

  private static func statusString(_ status: CKAccountStatus) -> String {
    switch status {
    case .available: return "available"
    case .noAccount: return "noAccount"
    case .restricted: return "restricted"
    case .couldNotDetermine: return "couldNotDetermine"
    case .temporarilyUnavailable: return "temporarilyUnavailable"
    @unknown default: return "couldNotDetermine"
    }
  }

  private static func ckValue(_ value: Any) -> CKRecordValue? {
    if let b = value as? Bool { return NSNumber(value: b) }
    if let s = value as? String { return s as NSString }
    if let n = value as? NSNumber { return n }
    if let d = value as? Double { return NSNumber(value: d) }
    return nil
  }

  private static func dictionary(from record: CKRecord?) -> [String: Any] {
    guard let record = record else { return [:] }
    var out: [String: Any] = [
      "recordName": record.recordID.recordName,
      "recordType": record.recordType
    ]
    for key in record.allKeys() {
      let value = record[key]
      if let s = value as? String {
        out[key] = s
      } else if let n = value as? NSNumber {
        out[key] = n.doubleValue
      }
    }
    return out
  }
}
