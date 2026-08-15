import Foundation
import Security

enum CredentialStorageScope: String, Sendable {
    case liveKeychain = "live-keychain"
    case uiTestingFile = "ui-testing-file"
    case inMemory = "in-memory"
    case failing
}

enum CredentialPersistenceError: LocalizedError, Sendable {
    case unavailable(OSStatus)
    case invalidStoredCredential

    var errorDescription: String? {
        switch self {
        case .unavailable:
            "安全凭据服务不可用"
        case .invalidStoredCredential:
            "安全凭据数据无效"
        }
    }
}

/// Keeps prototype credentials outside AppSnapshot and UserDefaults.
struct CredentialPersistence: Sendable {
    let scope: CredentialStorageScope
    let load: @Sendable () throws -> String?
    let save: @Sendable (String) throws -> Void
    let reset: @Sendable () throws -> Void

    static let live = CredentialPersistence(
        scope: .liveKeychain,
        load: {
            let query: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: service,
                kSecAttrAccount: account,
                kSecReturnData: true,
                kSecMatchLimit: kSecMatchLimitOne
            ]
            var result: CFTypeRef?
            let status = SecItemCopyMatching(query as CFDictionary, &result)
            if status == errSecItemNotFound { return nil }
            guard status == errSecSuccess else { throw CredentialPersistenceError.unavailable(status) }
            guard let data = result as? Data, let password = String(data: data, encoding: .utf8) else {
                throw CredentialPersistenceError.invalidStoredCredential
            }
            return password
        },
        save: { password in
            let query: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: service,
                kSecAttrAccount: account
            ]
            let attributes: [CFString: Any] = [kSecValueData: Data(password.utf8)]
            let updateStatus = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
            if updateStatus == errSecSuccess { return }
            guard updateStatus == errSecItemNotFound else { throw CredentialPersistenceError.unavailable(updateStatus) }
            var newItem = query
            newItem[kSecValueData] = Data(password.utf8)
            newItem[kSecAttrAccessible] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            let addStatus = SecItemAdd(newItem as CFDictionary, nil)
            guard addStatus == errSecSuccess else { throw CredentialPersistenceError.unavailable(addStatus) }
        },
        reset: {
            let query: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrService: service,
                kSecAttrAccount: account
            ]
            let status = SecItemDelete(query as CFDictionary)
            guard status == errSecSuccess || status == errSecItemNotFound else {
                throw CredentialPersistenceError.unavailable(status)
            }
        }
    )

    static let failing = CredentialPersistence(
        scope: .failing,
        load: { throw CredentialPersistenceError.unavailable(errSecNotAvailable) },
        save: { _ in throw CredentialPersistenceError.unavailable(errSecNotAvailable) },
        reset: { throw CredentialPersistenceError.unavailable(errSecNotAvailable) }
    )

    static func inMemory(initialPassword: String? = nil) -> CredentialPersistence {
        let storage = InMemoryCredentialStorage(password: initialPassword)
        return CredentialPersistence(
            scope: .inMemory,
            load: { storage.password },
            save: { storage.password = $0 },
            reset: { storage.password = nil }
        )
    }

    static func uiTesting(storageURL: URL? = nil) -> CredentialPersistence {
        let fileURL = storageURL ?? uiTestingStorageURL()
        return CredentialPersistence(
            scope: .uiTestingFile,
            load: {
                guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
                guard let password = String(data: try Data(contentsOf: fileURL), encoding: .utf8) else {
                    throw CredentialPersistenceError.invalidStoredCredential
                }
                return password
            },
            save: { password in
                try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
                try Data(password.utf8).write(to: fileURL, options: [.atomic, .completeFileProtectionUnlessOpen])
            },
            reset: {
                guard FileManager.default.fileExists(atPath: fileURL.path) else { return }
                try FileManager.default.removeItem(at: fileURL)
            }
        )
    }

    static func resetUITestingStorage() throws {
        try uiTesting().reset()
    }

    private static let service = "com.coffeelink.app.prototype.credentials"
    private static let account = "local-auth-password"

    private static func uiTestingStorageURL() -> URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appending(path: "CoffeeLinkUITests/credential.txt")
    }
}

private final class InMemoryCredentialStorage: @unchecked Sendable {
    var password: String?

    init(password: String?) {
        self.password = password
    }
}
