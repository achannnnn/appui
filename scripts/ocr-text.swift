import Foundation
import Vision
import ImageIO
import CoreGraphics

guard CommandLine.arguments.count >= 2 else {
  fputs("usage: ocr-text <image>\n", stderr)
  exit(2)
}

let url = URL(fileURLWithPath: CommandLine.arguments[1])
guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
  fputs("failed to load image\n", stderr)
  exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = false
request.recognitionLanguages = ["ja-JP", "en-US"]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
do {
  try handler.perform([request])
} catch {
  fputs("ocr failed: \(error)\n", stderr)
  exit(1)
}

struct Box: Encodable {
  let text: String
  let x: Double
  let y: Double
  let w: Double
  let h: Double
}

let observations = request.results ?? []
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
