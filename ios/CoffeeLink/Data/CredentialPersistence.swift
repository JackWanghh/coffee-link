import Foundation
import Security

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
    let load: @Sendable () throws -> String?
    let save: @Sendable (String) throws -> Void
    let reset: @Sendable () throws -> Void

    static let live = CredentialPersistence(
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
        load: { throw CredentialPersistenceError.unavailable(errSecNotAvailable) },
        save: { _ in throw CredentialPersistenceError.unavailable(errSecNotAvailable) },
        reset: { throw CredentialPersistenceError.unavailable(errSecNotAvailable) }
    )

    static func inMemory(initialPassword: String? = nil) -> CredentialPersistence {
        let storage = InMemoryCredentialStorage(password: initialPassword)
        return CredentialPersistence(
            load: { storage.password },
            save: { storage.password = $0 },
            reset: { storage.password = nil }
        )
    }

    private static let service = "com.coffeelink.app.prototype.credentials"
    private static let account = "local-auth-password"
}

private final class InMemoryCredentialStorage: @unchecked Sendable {
    var password: String?

    init(password: String?) {
        self.password = password
    }
}
