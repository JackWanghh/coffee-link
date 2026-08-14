import Foundation

struct AppSnapshot: Codable, Equatable, Sendable {
    var currentUser: UserProfile
    var sharers: [Sharer]
    var sessions: [ChatSession]

    static let demo = DemoData.snapshot
}

struct LocalPersistence: Sendable {
    let load: @Sendable () throws -> AppSnapshot?
    let save: @Sendable (AppSnapshot) throws -> Void

    static let live = LocalPersistence(
        load: {
            let fileURL = try storageURL()
            guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
            return try JSONDecoder().decode(AppSnapshot.self, from: Data(contentsOf: fileURL))
        },
        save: { snapshot in
            let fileURL = try storageURL()
            try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
            try encoder.encode(snapshot).write(to: fileURL, options: .atomic)
        }
    )

    static let inMemory = LocalPersistence(load: { nil }, save: { _ in })

    private static func storageURL() throws -> URL {
        guard let applicationSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            throw CocoaError(.fileNoSuchFile)
        }
        return applicationSupport.appending(path: "CoffeeLink/state.json")
    }
}
