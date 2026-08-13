import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SWIFT_SRC = path.join(__dirname, 'ocr-text.swift')
const OCR_BIN = path.join(__dirname, 'ocr-text')

const LIST_MAX_WIDTH = 600
const DETAIL_MAX_WIDTH = 1200
const DISPLAY_WEBP_QUALITY = 90
const PAD_X = 0.012
const PAD_Y = 0.008

const EMAIL_STRICT_RE = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i
const FULLWIDTH_EMAIL_RE =
  /[A-Za-z0-9._%+\-]+[\uFF20@][A-Za-z0-9.\-]+\.[A-Za-z]{2,}/
const PHONE_RE =
  /(?:\+81[- ]?)?(?:0[7-9]0-?\d{4}-?\d{4}|0\d{1,4}-\d{2,4}-\d{4})/
const NAME_RE = /\bERIKA\b/i
const ACCOUNT_ID_RE =
  /\b(?=[A-Za-z0-9]*[A-Z])(?=[A-Za-z0-9]*[a-z])\d[A-Za-z0-9]{11,17}\b/
const EXTRA_LITERALS = [
  '9a1dpJNXcoWCAb',
  '9aldpJNXcoWCAb',
  '9aldpJNXcOWCAb',
  '110-0001',
  '1100001',
  '台東区谷中',
]

function isPiiText(text) {
  const raw = String(text || '')
  const normalized = raw.replace(/\uFF20/g, '@').replace(/\s+/g, '')
  if (EMAIL_STRICT_RE.test(normalized) || FULLWIDTH_EMAIL_RE.test(raw)) return 'email'
  if (PHONE_RE.test(normalized)) return 'phone'
  if (NAME_RE.test(raw) || NAME_RE.test(normalized)) return 'name'
  if (EXTRA_LITERALS.some((value) => raw.toLowerCase().includes(value.toLowerCase()))) return 'id'
  if (ACCOUNT_ID_RE.test(raw) || ACCOUNT_ID_RE.test(normalized)) return 'id'
  return null
}

function runCmd(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} failed (${code})`))
        return
      }
      resolve(stdout)
    })
  })
}

async function ensureOcrBin() {
  try {
    await fs.access(OCR_BIN)
    return
  } catch {
    // compile once
  }
  await runCmd('swiftc', ['-O', '-o', OCR_BIN, SWIFT_SRC])
}

async function runOcr(imagePath) {
  await ensureOcrBin()
  const tmp = path.join(os.tmpdir(), `appui-ocr-${process.pid}-${Date.now()}.png`)
  await sharp(imagePath, { animated: false })
    .rotate()
    .resize({ width: 1000, withoutEnlargement: true })
    .png()
    .toFile(tmp)
  try {
    const stdout = await runCmd(OCR_BIN, [tmp])
    return JSON.parse(stdout || '[]')
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }
}

function boxesToRects(boxes, width, height) {
  const rects = []
  for (const box of boxes) {
    const kind = isPiiText(box.text)
    if (!kind) continue
    const x = Math.max(0, Math.round((box.x - PAD_X) * width))
    const y = Math.max(0, Math.round((1 - box.y - box.h - PAD_Y) * height))
    const w = Math.min(width - x, Math.round((box.w + PAD_X * 2) * width))
    const h = Math.min(height - y, Math.round((box.h + PAD_Y * 2) * height))
    if (w < 4 || h < 4) continue
    rects.push({ kind, text: box.text, x, y, w, h })
  }
  return rects
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .webp({
      quality: DISPLAY_WEBP_QUALITY,
      alphaQuality: DISPLAY_WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
    })
    .toBuffer()
}

function variantSiblingPath(filePath, variant) {
  const ext = path.extname(filePath)
  const base = filePath.slice(0, filePath.length - ext.length)
  return `${base}.${variant}${ext}`
}

async function listMasterImages(target) {
  const abs = path.resolve(ROOT, target)
  const stat = await fs.stat(abs)
  if (stat.isFile()) return [abs]
  const out = []
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(next)
        continue
      }
      if (!/\.(webp|png|jpe?g)$/i.test(entry.name)) continue
      if (/\.(list|detail|display)\.(webp|png|jpe?g)$/i.test(entry.name)) continue
      if (/^screen-\d+/i.test(entry.name)) continue
      out.push(next)
    }
  }
  await walk(abs)
  return out.sort()
}

async function redactImage(filePath, { apply }) {
  const boxes = await runOcr(filePath)
  const meta = await sharp(filePath).metadata()
  const width = meta.width || 0
  const height = meta.height || 0
  const rects = boxesToRects(boxes, width, height)
  if (rects.length === 0) return { file: filePath, hits: [] }

  if (apply) {
    const overlays = rects.map((rect) => ({
      input: {
        create: {
          width: rect.w,
          height: rect.h,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      },
      left: rect.x,
      top: rect.y,
    }))
    const redacted = await sharp(filePath).composite(overlays).toBuffer()
    const master = await sharp(redacted, { animated: false })
      .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
      .toBuffer()
    await fs.writeFile(filePath, master)
    if (filePath.endsWith('.webp')) {
      await fs.writeFile(variantSiblingPath(filePath, 'list'), await toDisplayWebp(master, LIST_MAX_WIDTH))
      await fs.writeFile(variantSiblingPath(filePath, 'detail'), await toDisplayWebp(master, DETAIL_MAX_WIDTH))
    }
  }

  return {
    file: path.relative(ROOT, filePath),
    hits: rects.map(({ kind, text }) => ({ kind, text })),
  }
}

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const targets = args.filter((arg) => arg !== '--apply')
const scanTargets = targets.length > 0 ? targets : ['public/appui-images']

const files = []
for (const target of scanTargets) {
  files.push(...(await listMasterImages(target)))
}

console.log(`${apply ? 'redact' : 'scan'} ${files.length} images`)
const changed = []
let i = 0
for (const file of files) {
  i += 1
  try {
    const result = await redactImage(file, { apply })
    if (result.hits.length) {
      changed.push(result)
      console.log(`${i}/${files.length} HIT ${result.file} ${JSON.stringify(result.hits)}`)
    } else if (i % 25 === 0) {
      console.log(`${i}/${files.length}`)
    }
  } catch (error) {
    console.warn(`${i}/${files.length} skip ${path.relative(ROOT, file)}: ${error instanceof Error ? error.message : error}`)
  }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'scan', files: files.length, hits: changed.length, changed }, null, 2))
