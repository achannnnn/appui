import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OCR_BIN = path.join(__dirname, 'ocr-text')
const TARGET = path.join(ROOT, 'public/appui-images/rarejob')

const LIST = 600
const DETAIL = 1200

// RareJob teacher display names end with 先生, or short handle + 先生 in one OCR box.
const TEACHER_NAME_RE = /^[A-Za-z][A-Za-z.\s]{0,24}先生$/

function runCmd(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (c) => { stdout += c })
    child.stderr.on('data', (c) => { stderr += c })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(stderr.trim() || `${command} failed (${code})`))
      else resolve(stdout)
    })
  })
}

async function runOcr(imagePath) {
  const tmp = path.join(os.tmpdir(), `rj-ocr-${process.pid}-${Date.now()}.png`)
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

function boxToPx(box, width, height) {
  const x = Math.max(0, Math.round(box.x * width))
  const y = Math.max(0, Math.round((1 - box.y - box.h) * height))
  const w = Math.min(width - x, Math.round(box.w * width))
  const h = Math.min(height - y, Math.round(box.h * height))
  return { x, y, w, h }
}

function circleSvg(diameter) {
  const r = diameter / 2
  return Buffer.from(
    `<svg width="${diameter}" height="${diameter}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r}" fill="white"/></svg>`,
  )
}

function rectSvg(w, h) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="white"/></svg>`,
  )
}

function teacherRects(boxes, width, height) {
  const rects = []
  for (const box of boxes) {
    const text = String(box.text || '').trim()
    if (!TEACHER_NAME_RE.test(text)) continue
    if (/Demo/.test(text)) continue

    const px = boxToPx(box, width, height)
    const padX = Math.round(width * 0.012)
    const padY = Math.round(height * 0.006)
    rects.push({
      kind: 'name',
      text,
      x: Math.max(0, px.x - padX),
      y: Math.max(0, px.y - padY),
      w: Math.min(width - px.x + padX, px.w + padX * 2 + Math.round(width * 0.04)),
      h: px.h + padY * 2,
    })

    const r = Math.round(Math.min(width, height) * 0.048)
    const cx = Math.max(r + 4, px.x - Math.round(width * 0.105))
    const cy = px.y + Math.round(px.h / 2)
    rects.push({ kind: 'avatar', text, cx, cy, r })
  }
  return rects
}

async function listImages(dir) {
  const out = []
  for (const name of await fs.readdir(dir)) {
    if (!/^IMG_\d+\.webp$/i.test(name)) continue
    out.push(path.join(dir, name))
  }
  return out.sort()
}

async function redactFile(filePath, { apply }) {
  const boxes = await runOcr(filePath)
  const meta = await sharp(filePath).metadata()
  const width = meta.width || 0
  const height = meta.height || 0
  const rects = teacherRects(boxes, width, height)
  if (rects.length === 0) return { file: filePath, hits: [] }

  if (apply) {
    const overlays = []
    for (const rect of rects) {
      if (rect.kind === 'avatar') {
        const d = rect.r * 2
        overlays.push({
          input: circleSvg(d),
          left: Math.max(0, rect.cx - rect.r),
          top: Math.max(0, rect.cy - rect.r),
        })
      } else {
        overlays.push({
          input: rectSvg(rect.w, rect.h),
          left: rect.x,
          top: rect.y,
        })
      }
    }
    const redacted = await sharp(filePath).composite(overlays).toBuffer()
    const master = await sharp(redacted, { animated: false })
      .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
      .toBuffer()
    await fs.writeFile(filePath, master)
    const mk = (w) =>
      sharp(master)
        .resize({ width: w, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
        .webp({ quality: 90, alphaQuality: 90, effort: 4, smartSubsample: false })
        .toBuffer()
    await fs.writeFile(filePath.replace(/\.webp$/, '.list.webp'), await mk(LIST))
    await fs.writeFile(filePath.replace(/\.webp$/, '.detail.webp'), await mk(DETAIL))
  }

  return {
    file: path.relative(ROOT, filePath),
    hits: rects.map(({ kind, text }) => ({ kind, text })),
  }
}

const apply = process.argv.includes('--apply')
const files = await listImages(TARGET)
console.log(`${apply ? 'redact teacher avatars' : 'scan teacher avatars'} ${files.length} images`)
const changed = []
for (let i = 0; i < files.length; i++) {
  try {
    const result = await redactFile(files[i], { apply })
    if (result.hits.length) {
      changed.push(result)
      console.log(`${i + 1}/${files.length} HIT ${result.file} ${JSON.stringify(result.hits)}`)
    }
  } catch (e) {
    console.warn(`${i + 1}/${files.length} skip ${path.basename(files[i])}: ${e.message}`)
  }
}
console.log(JSON.stringify({ hits: changed.length, changed }, null, 2))
