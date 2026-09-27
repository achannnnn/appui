import Foundation
import Vision
import ImageIO
import CoreGraphics
import CoreVideo

guard CommandLine.arguments.count >= 2 else {
  fputs("usage: ocr-text <image>\n", stderr)
  exit(2)
}

let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(source, 0, [
        kCGImageSourceShouldCache: true
      ] as CFDictionary) else {
  fputs("failed to load image\n", stderr)
  exit(1)
}

func rgbImage(_ image: CGImage) -> CGImage? {
  let width = image.width
  let height = image.height
  let colorSpace = CGColorSpaceCreateDeviceRGB()
  let bitmapInfo = CGBitmapInfo.byteOrder32Little.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue
  guard let ctx = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: width * 4,
    space: colorSpace,
    bitmapInfo: bitmapInfo
  ) else { return nil }
  ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
  return ctx.makeImage()
}

guard let prepared = rgbImage(cgImage) else {
  fputs("failed to convert image\n", stderr)
  exit(1)
}

func runOCR(_ level: VNRequestTextRecognitionLevel, langs: [String]?) throws -> [VNRecognizedTextObservation] {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = level
  request.usesLanguageCorrection = false
  if let langs {
    request.recognitionLanguages = langs
  }
  if #available(macOS 13.0, *) {
    request.automaticallyDetectsLanguage = langs == nil
  }
  let handler = VNImageRequestHandler(cgImage: prepared, orientation: .up, options: [:])
  try handler.perform([request])
  return request.results ?? []
}

var observations: [VNRecognizedTextObservation] = []
var lastError: Error?
let attempts: [() throws -> [VNRecognizedTextObservation]] = [
  { try runOCR(.accurate, langs: nil) },
  { try runOCR(.accurate, langs: ["ja-JP", "en-US"]) },
  { try runOCR(.fast, langs: nil) },
  { try runOCR(.fast, langs: ["en-US"]) },
]
for attempt in attempts {
  do {
    observations = try attempt()
    lastError = nil
    break
  } catch {
    lastError = error
  }
}
if let lastError {
  fputs("ocr failed: \(lastError)\n", stderr)
  exit(1)
}

struct Box: Encodable {
  let text: String
  let x: Double
  let y: Double
  let w: Double
  let h: Double
}

let boxes: [Box] = observations.compactMap { observation in
  guard let candidate = observation.topCandidates(1).first else { return nil }
  let r = observation.boundingBox
  return Box(
    text: candidate.string,
    x: Double(r.origin.x),
    y: Double(r.origin.y),
    w: Double(r.size.width),
    h: Double(r.size.height)
  )
}

do {
  let data = try JSONEncoder().encode(boxes)
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data("\n".utf8))
} catch {
  fputs("json encode failed: \(error)\n", stderr)
  exit(1)
}
