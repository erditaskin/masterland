// Offline design renderer. This tool is not linked into either mobile platform.
import AppKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

struct Command: Decodable {
    var kind: String
    var rect: [Double]?
    var fill: String?
    var end: String?
    var stroke: String?
    var line: Double?
    var radius: Double?
    var text: String?
    var size: Double?
    var bold: Bool?
    var align: String?
    var file: String?
    var crop: [Double]?
    var fit: Bool?
    var clip: [Double]?
    var font: String?
}
struct Screen: Decodable {
    var id: String
    var width: Int
    var height: Int
    var commands: [Command]
}
var cache: [String: CGImage] = [:]
func asset(_ file: String) -> CGImage {
    if let image = cache[file] { return image }
    guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: file) as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { fatalError("Missing design asset: \(file)") }
    cache[file] = image
    return image
}
func color(_ hex: String) -> NSColor {
    let value = UInt32(hex.replacingOccurrences(of: "#", with: ""), radix: 16)!
    return NSColor(srgbRed: CGFloat((value >> 16) & 255) / 255,
                   green: CGFloat((value >> 8) & 255) / 255,
                   blue: CGFloat(value & 255) / 255, alpha: 1)
}
func render(_ screen: Screen, to output: URL) throws {
    let space = CGColorSpace(name: CGColorSpace.sRGB)!
    let context = CGContext(data: nil, width: screen.width, height: screen.height,
                            bitsPerComponent: 8, bytesPerRow: screen.width * 4, space: space,
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.translateBy(x: 0, y: CGFloat(screen.height))
    context.scaleBy(x: 1, y: -1)
    context.interpolationQuality = .high
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(cgContext: context, flipped: true)
    for command in screen.commands {
        let a = command.rect ?? [0, 0, 0, 0]
        var rect = CGRect(x: a[0], y: a[1], width: a[2], height: a[3])
        context.saveGState()
        if let clip = command.clip {
            context.clip(to: CGRect(x: clip[0], y: clip[1], width: clip[2], height: clip[3]))
        }
        if command.kind == "rect" || command.kind == "shield" || command.kind == "system-home-indicator" {
            let path: CGPath
            if command.kind == "shield" {
                let shield = CGMutablePath()
                shield.move(to: CGPoint(x: rect.midX, y: rect.minY + 4))
                shield.addLine(to: CGPoint(x: rect.maxX - 8, y: rect.minY))
                shield.addLine(to: CGPoint(x: rect.maxX, y: rect.minY + 22))
                shield.addLine(to: CGPoint(x: rect.maxX - 7, y: rect.maxY - 35))
                shield.addLine(to: CGPoint(x: rect.midX, y: rect.maxY))
                shield.addLine(to: CGPoint(x: rect.minX + 7, y: rect.maxY - 35))
                shield.addLine(to: CGPoint(x: rect.minX, y: rect.minY + 22))
                shield.addLine(to: CGPoint(x: rect.minX + 8, y: rect.minY))
                shield.closeSubpath()
                path = shield
            } else {
                path = CGPath(roundedRect: rect, cornerWidth: command.radius ?? 0,
                              cornerHeight: command.radius ?? 0, transform: nil)
            }
            context.addPath(path)
            if let end = command.end, let start = command.fill {
                context.saveGState()
                context.clip()
                let gradient = CGGradient(colorsSpace: space,
                    colors: [color(start).cgColor, color(end).cgColor] as CFArray,
                    locations: [0, 1])!
                context.drawLinearGradient(gradient, start: CGPoint(x: rect.minX, y: rect.minY),
                    end: CGPoint(x: rect.maxX, y: rect.maxY), options: [])
                context.restoreGState()
            } else if let fill = command.fill {
                context.setFillColor(color(fill).cgColor)
                context.fillPath()
            }
            if let stroke = command.stroke {
                context.addPath(path)
                context.setStrokeColor(color(stroke).cgColor)
                context.setLineWidth(command.line ?? 2)
                context.strokePath()
            }
        } else if command.kind == "image" {
            var image = asset(command.file!)
            if let crop = command.crop {
                image = image.cropping(to: CGRect(x: crop[0], y: crop[1], width: crop[2], height: crop[3]))!
            }
            if command.fit == true {
                let scale = min(rect.width / CGFloat(image.width), rect.height / CGFloat(image.height))
                let size = CGSize(width: CGFloat(image.width) * scale, height: CGFloat(image.height) * scale)
                rect = CGRect(x: rect.midX - size.width / 2, y: rect.midY - size.height / 2, width: size.width, height: size.height)
            }
            if let radius = command.radius {
                context.addPath(CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil))
                context.clip()
            }
            context.translateBy(x: rect.minX, y: rect.maxY)
            context.scaleBy(x: 1, y: -1)
            context.draw(image, in: CGRect(origin: .zero, size: rect.size))
        } else if command.kind == "text" {
            let paragraph = NSMutableParagraphStyle()
            paragraph.alignment = command.align == "center" ? .center : command.align == "right" ? .right : .left
            paragraph.lineBreakMode = .byWordWrapping
            let font = NSFont(name: command.font ?? (command.bold == true ? "Georgia-Bold" : "Georgia"), size: command.size ?? 42)!
            let attributes: [NSAttributedString.Key: Any] = [
                .font: font, .foregroundColor: color(command.fill ?? "#583715"), .paragraphStyle: paragraph]
            let text = command.text! as NSString
            let measured = text.boundingRect(with: rect.size, options: [.usesLineFragmentOrigin, .usesFontLeading], attributes: attributes)
            let drawRect = CGRect(x: rect.minX, y: rect.minY + max(0, (rect.height - measured.height) / 2),
                                   width: rect.width, height: min(rect.height, measured.height + 3))
            text.draw(with: drawRect, options: [.usesLineFragmentOrigin, .usesFontLeading], attributes: attributes)
        }
        context.restoreGState()
    }
    NSGraphicsContext.restoreGraphicsState()
    let image = context.makeImage()!
    guard let destination = CGImageDestinationCreateWithURL(output as CFURL, UTType.png.identifier as CFString, 1, nil) else { fatalError("Cannot write reference") }
    CGImageDestinationAddImage(destination, image, [kCGImagePropertyPNGDictionary: [kCGImagePropertyPNGsRGBIntent: 0]] as CFDictionary)
    guard CGImageDestinationFinalize(destination) else { fatalError("PNG encoding failed") }
}

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let files = try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil).filter { $0.pathExtension == "json" }.sorted { $0.path < $1.path }
for file in files {
    let screen = try JSONDecoder().decode(Screen.self, from: Data(contentsOf: file))
    try render(screen, to: output.appendingPathComponent(screen.id + ".png"))
    print("Rendered \(screen.id) \(screen.width)x\(screen.height)")
}
