import AppKit
import Foundation

private let equalityThreshold: UInt8 = 12

private struct ComparisonError: Error, CustomStringConvertible {
    let description: String
}

private struct RGBAImage {
    let width: Int
    let height: Int
    var pixels: [UInt8]

    var bytesPerRow: Int { width * 4 }
}

private struct Arguments {
    let referenceURL: URL
    let captureURL: URL
    let name: String
    let resultsRootURL: URL

    init(commandLine: [String]) throws {
        guard commandLine.count == 4 || commandLine.count == 5 else {
            throw ComparisonError(
                description: "usage: compare.swift <reference.png> <capture.png> <name> [results-root]"
            )
        }

        let requestedName = commandLine[3]
        let permittedNameCharacters = CharacterSet.alphanumerics.union(CharacterSet(charactersIn: "-_."))
        guard !requestedName.isEmpty,
              requestedName != ".",
              requestedName != "..",
              requestedName.unicodeScalars.allSatisfy(permittedNameCharacters.contains) else {
            throw ComparisonError(
                description: "name must contain only letters, numbers, hyphens, underscores, or periods"
            )
        }

        referenceURL = URL(fileURLWithPath: commandLine[1]).standardizedFileURL
        captureURL = URL(fileURLWithPath: commandLine[2]).standardizedFileURL
        name = requestedName

        if commandLine.count == 5 {
            resultsRootURL = URL(fileURLWithPath: commandLine[4]).standardizedFileURL
        } else {
            let scriptDirectory = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
            resultsRootURL = scriptDirectory.appendingPathComponent("Results", isDirectory: true)
        }
    }
}

private func decodeRGBA(at url: URL) throws -> RGBAImage {
    guard FileManager.default.fileExists(atPath: url.path) else {
        throw ComparisonError(description: "image not found: \(url.path)")
    }

    let encodedData: Data
    do {
        encodedData = try Data(contentsOf: url, options: [.mappedIfSafe])
    } catch {
        throw ComparisonError(description: "unable to read image: \(url.path)")
    }

    guard let source = NSBitmapImageRep(data: encodedData),
          source.pixelsWide > 0,
          source.pixelsHigh > 0 else {
        throw ComparisonError(description: "unable to decode image: \(url.path)")
    }

    let width = source.pixelsWide
    let height = source.pixelsHigh
    guard let sourceImage = source.cgImage else {
        throw ComparisonError(description: "unable to decode image pixels: \(url.path)")
    }

    var pixels = [UInt8](repeating: 0, count: width * height * 4)
    let rendered = pixels.withUnsafeMutableBytes { storage -> Bool in
        guard let baseAddress = storage.baseAddress,
              let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
              let context = CGContext(
                data: baseAddress,
                width: width,
                height: height,
                bitsPerComponent: 8,
                bytesPerRow: width * 4,
                space: colorSpace,
                bitmapInfo: CGBitmapInfo.byteOrder32Big.rawValue
                  | CGImageAlphaInfo.premultipliedLast.rawValue
              ) else {
            return false
        }

        context.clear(CGRect(x: 0, y: 0, width: width, height: height))
        context.interpolationQuality = .none
        context.draw(sourceImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        return true
    }

    guard rendered else {
        throw ComparisonError(description: "unable to create 8-bit sRGB RGBA image: \(url.path)")
    }

    return RGBAImage(
        width: width,
        height: height,
        pixels: pixels
    )
}

private func makeOutputImage(width: Int, height: Int) throws -> RGBAImage {
    return RGBAImage(
        width: width,
        height: height,
        pixels: [UInt8](repeating: 0, count: width * height * 4)
    )
}

private func sourceOverPremultiplied(
    background: (red: UInt8, green: UInt8, blue: UInt8, alpha: UInt8),
    foreground: (red: UInt8, green: UInt8, blue: UInt8, alpha: UInt8),
    foregroundFraction: Double
) -> (red: UInt8, green: UInt8, blue: UInt8, alpha: UInt8) {
    let foregroundAlpha = (Double(foreground.alpha) / 255) * foregroundFraction
    let backgroundAlpha = Double(background.alpha) / 255
    let outputAlpha = foregroundAlpha + backgroundAlpha * (1 - foregroundAlpha)

    func blend(_ backgroundChannel: UInt8, _ foregroundChannel: UInt8) -> UInt8 {
        let foregroundContribution = Double(foregroundChannel) * foregroundFraction
        let backgroundContribution = Double(backgroundChannel) * (1 - foregroundAlpha)
        let value = foregroundContribution + backgroundContribution
        return UInt8(clamping: Int(value.rounded()))
    }

    return (
        blend(background.red, foreground.red),
        blend(background.green, foreground.green),
        blend(background.blue, foreground.blue),
        UInt8(clamping: Int((outputAlpha * 255).rounded()))
    )
}

private func writePNG(_ image: RGBAImage, to url: URL) throws {
    guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB),
          let provider = CGDataProvider(data: Data(image.pixels) as CFData),
          let cgImage = CGImage(
            width: image.width,
            height: image.height,
            bitsPerComponent: 8,
            bitsPerPixel: 32,
            bytesPerRow: image.bytesPerRow,
            space: colorSpace,
            bitmapInfo: CGBitmapInfo(
                rawValue: CGBitmapInfo.byteOrder32Big.rawValue
                  | CGImageAlphaInfo.premultipliedLast.rawValue
            ),
            provider: provider,
            decode: nil,
            shouldInterpolate: false,
            intent: .defaultIntent
          ) else {
        throw ComparisonError(description: "unable to create output bitmap: \(url.path)")
    }

    let representation = NSBitmapImageRep(cgImage: cgImage)
    guard let pngData = representation.representation(using: .png, properties: [:]) else {
        throw ComparisonError(description: "unable to encode PNG: \(url.path)")
    }

    do {
        try pngData.write(to: url, options: [.atomic])
    } catch {
        throw ComparisonError(description: "unable to write PNG: \(url.path)")
    }
}

private func ratioText(differentPixels: Int, totalPixels: Int) -> String {
    guard differentPixels != 0 else { return "0" }

    var value = String(format: "%.12f", Double(differentPixels) / Double(totalPixels))
    while value.last == "0" {
        value.removeLast()
    }
    if value.last == "." {
        value.removeLast()
    }
    return value
}

private func compare(_ arguments: Arguments) throws -> String {
    let reference = try decodeRGBA(at: arguments.referenceURL)
    let capture = try decodeRGBA(at: arguments.captureURL)

    guard reference.width == capture.width,
          reference.height == capture.height else {
        throw ComparisonError(
            description: "dimension mismatch: reference=\(reference.width)x\(reference.height), capture=\(capture.width)x\(capture.height)"
        )
    }

    var overlay = try makeOutputImage(width: reference.width, height: reference.height)
    var difference = try makeOutputImage(width: reference.width, height: reference.height)
    var differentPixels = 0

    for y in 0..<reference.height {
        for x in 0..<reference.width {
            let offset = y * reference.bytesPerRow + x * 4
            let redDelta = abs(Int(reference.pixels[offset]) - Int(capture.pixels[offset]))
            let greenDelta = abs(Int(reference.pixels[offset + 1]) - Int(capture.pixels[offset + 1]))
            let blueDelta = abs(Int(reference.pixels[offset + 2]) - Int(capture.pixels[offset + 2]))

            if max(redDelta, greenDelta, blueDelta) > Int(equalityThreshold) {
                differentPixels += 1
            }

            difference.pixels[offset] = UInt8(redDelta)
            difference.pixels[offset + 1] = UInt8(greenDelta)
            difference.pixels[offset + 2] = UInt8(blueDelta)
            difference.pixels[offset + 3] = 255

            let blended = sourceOverPremultiplied(
                background: (
                    reference.pixels[offset],
                    reference.pixels[offset + 1],
                    reference.pixels[offset + 2],
                    reference.pixels[offset + 3]
                ),
                foreground: (
                    capture.pixels[offset],
                    capture.pixels[offset + 1],
                    capture.pixels[offset + 2],
                    capture.pixels[offset + 3]
                ),
                foregroundFraction: 0.5
            )
            overlay.pixels[offset] = blended.red
            overlay.pixels[offset + 1] = blended.green
            overlay.pixels[offset + 2] = blended.blue
            overlay.pixels[offset + 3] = blended.alpha
        }
    }

    let resultDirectory = arguments.resultsRootURL.appendingPathComponent(arguments.name, isDirectory: true)
    do {
        try FileManager.default.createDirectory(
            at: resultDirectory,
            withIntermediateDirectories: true
        )
    } catch {
        throw ComparisonError(description: "unable to create results directory: \(resultDirectory.path)")
    }

    try writePNG(overlay, to: resultDirectory.appendingPathComponent("overlay.png"))
    try writePNG(difference, to: resultDirectory.appendingPathComponent("difference.png"))

    let totalPixels = reference.width * reference.height
    let metrics = [
        "different_pixels=\(differentPixels)",
        "total_pixels=\(totalPixels)",
        "difference_ratio=\(ratioText(differentPixels: differentPixels, totalPixels: totalPixels))",
    ].joined(separator: "\n")

    do {
        try (metrics + "\n").write(
            to: resultDirectory.appendingPathComponent("metrics.txt"),
            atomically: true,
            encoding: .utf8
        )
    } catch {
        throw ComparisonError(description: "unable to write metrics: \(resultDirectory.path)")
    }

    return metrics
}

do {
    let arguments = try Arguments(commandLine: CommandLine.arguments)
    let metrics = try compare(arguments)
    print(metrics)
} catch {
    fputs("error: \(error)\n", stderr)
    exit(EXIT_FAILURE)
}
