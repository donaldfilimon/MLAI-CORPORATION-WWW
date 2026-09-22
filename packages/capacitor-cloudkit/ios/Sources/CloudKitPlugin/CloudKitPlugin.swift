import Capacitor
import CloudKit

@objc(CloudKitPlugin)
public class CloudKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CloudKitPlugin"
    public let jsName = "CloudKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAccountStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "query", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
    ]

    private let container = CKContainer(identifier: "iCloud.dev.mlai.mobile")
    private var database: CKDatabase { container.privateCloudDatabase }

    @objc func isAvailable(_ call: CAPPluginCall) {
        container.accountStatus { status, error in
            if error != nil {
                call.resolve(["available": false])
                return
            }
            call.resolve(["available": status == .available])
        }
    }

    @objc func getAccountStatus(_ call: CAPPluginCall) {
        container.accountStatus { status, error in
            if let error = error {
                call.reject("ERR_ACCOUNT", error.localizedDescription)
                return
            }
            call.resolve(["status": CloudKitPlugin.statusString(status)])
        }
    }

    @objc func save(_ call: CAPPluginCall) {
        let recordType = call.getString("recordType") ?? ""
        guard !recordType.isEmpty else {
            call.reject("ERR_SAVE", "recordType is required")
            return
        }
        let recordName = call.getString("recordName")
        let recordID = recordName.map { CKRecord.ID(recordName: $0) } ?? CKRecord.ID()
        let record = CKRecord(recordType: recordType, recordID: recordID)
        let fields = call.getObject("fields") ?? [:]
        for (key, value) in fields {
            if let stored = CloudKitPlugin.ckValue(value) { record[key] = stored }
        }
        database.save(record) { saved, error in
            if let error = error {
                call.reject("ERR_SAVE", error.localizedDescription)
                return
            }
            call.resolve(CloudKitPlugin.dictionary(from: saved))
        }
    }

    @objc func query(_ call: CAPPluginCall) {
        let recordType = call.getString("recordType") ?? ""
        guard !recordType.isEmpty else {
            call.reject("ERR_QUERY", "recordType is required")
            return
        }
        let limit = call.getInt("limit") ?? 20
        let query = CKQuery(recordType: recordType, predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: "createdAt", ascending: false)]
        let operation = CKQueryOperation(query: query)
        operation.resultsLimit = limit
        var rows: [[String: Any]] = []
        operation.recordMatchedBlock = { _, result in
            if case .success(let record) = result {
                rows.append(CloudKitPlugin.dictionary(from: record))
            }
        }
        operation.queryResultBlock = { result in
            switch result {
            case .success:
                call.resolve(["records": rows])
            case .failure(let error):
                call.reject("ERR_QUERY", error.localizedDescription)
            }
        }
        database.add(operation)
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let recordName = call.getString("recordName"), !recordName.isEmpty else {
            call.reject("ERR_DELETE", "recordName is required")
            return
        }
        database.delete(withRecordID: CKRecord.ID(recordName: recordName)) { _, error in
            if let error = error {
                call.reject("ERR_DELETE", error.localizedDescription)
                return
            }
            call.resolve(["recordName": recordName])
        }
    }

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
            "recordType": record.recordType,
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
