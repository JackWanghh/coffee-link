import Foundation

enum APIError: LocalizedError {
    case invalidResponse
    case http(status: Int, code: String, message: String)
    case decoding

    var errorDescription: String? {
        switch self {
        case .invalidResponse: "服务响应无效"
        case .http(_, _, let message): message
        case .decoding: "数据解析失败"
        }
    }
}

struct APIEnvelope<T: Decodable>: Decodable {
    let data: T
}

private struct APIErrorEnvelope: Decodable {
    struct Body: Decodable {
        let code: String
        let message: String
    }

    let error: Body
}

struct APIClient {
    let baseURL: URL
    var accessToken: String?
    var refreshToken: String?

    private var encoder: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }

    private var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }

    func request<T: Decodable>(
        _ method: String,
        _ path: String,
        body: Data? = nil
    ) async throws -> T {
        var request = URLRequest(url: baseURL.appending(path: path))
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let accessToken {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.httpBody = body
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200..<300).contains(http.statusCode) else {
            if let envelope = try? decoder.decode(APIErrorEnvelope.self, from: data) {
                throw APIError.http(status: http.statusCode, code: envelope.error.code, message: envelope.error.message)
            }
            throw APIError.http(status: http.statusCode, code: "HTTP_\(http.statusCode)", message: "请求失败")
        }
        do {
            return try decoder.decode(APIEnvelope<T>.self, from: data).data
        } catch {
            throw APIError.decoding
        }
    }
}
