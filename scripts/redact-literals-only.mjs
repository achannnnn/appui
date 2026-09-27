import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OCR_BIN = path.join(ROOT, 'scripts/ocr-text')
const LIST = 600
const DETAIL = 1200
const Q = 90
const PAD = 0.018

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const literals = []
const targets = []
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (arg === '--apply') continue
  if (arg === '--literal') {
    literals.push(args[i + 1] || '')
    i += 1
    continue
  }
  if (arg.startsWith('--literal=')) {
    literals.push(arg.slice('--literal='.length))
    continue
  }
  targets.push(arg)
}

if (!literals.length) {
  console.error('Usage: node scripts/redact-literals-only.mjs [--apply] --literal TEXT ... <paths>')
  process.exit(1)
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', rej)
    child.on('close', (code) => (code ? rej(new Error(err || `${cmd} failed`)) : res(out)))
  })
}

async function listImages(target) {
  const abs = path.resolve(ROOT, target)
  const st = await fs.stat(abs)
  if (st.isFile()) return [abs]
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
      out.push(next)
    }
  }
  await walk(abs)
  return out.sort()
}

async function ocr(imagePath) {
  const tmp = path.join(os.tmpdir(), `lit-ocr-${process.pid}-${Date.now()}.png`)
  await sharp(imagePath, { animated: false })
    .rotate()
    .resize({ width: 1000, withoutEnlargement: true })
    .png()
    .toFile(tmp)
  try {
    return JSON.parse((await run(OCR_BIN, [tmp])) || '[]')
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }
}

function matchesLiteral(text) {
  const raw = String(text || '')
  return literals.some((lit) => lit && raw.includes(lit))
}

async function processFile(filePath) {
  const boxes = await ocr(filePath)
  const meta = await sharp(filePath).metadata()
  const W = meta.width || 0
  const H = meta.height || 0
  const rects = []
  for (const box of boxes) {
    if (!matchesLiteral(box.text)) continue
    const x = Math.max(0, Math.round((box.x - PAD) * W))
    const y = Math.max(0, Math.round((1 - box.y - box.h - PAD) * H))
    const w = Math.min(W - x, Math.round((box.w + PAD * 2) * W))
    const h = Math.min(H - y, Math.round((box.h + PAD * 2) * H))
    if (w < 4 || h < 4) continue
    rects.push({ text: String(box.text || ''), x, y, w, h })
  }
  if (!rects.length) return null

  if (apply) {
    const overlays = rects.map((r) => ({
      input: {
        create: {
          width: r.w,
          height: r.h,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      },
      left: r.x,
      top: r.y,
    }))
    const master = await sharp(await sharp(filePath).composite(overlays).toBuffer())
      .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
      .toBuffer()
    await fs.writeFile(filePath, master)
    if (filePath.endsWith('.webp')) {
      const stem = filePath.replace(/\.webp$/, '')
      const mk = (width) =>
        sharp(master)
          .resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .webp({ quality: Q, alphaQuality: Q, effort: 4, smartSubsample: false })
          .toBuffer()
      await fs.writeFile(`${stem}.list.webp`, await mk(LIST))
      await fs.writeFile(`${stem}.detail.webp`, await mk(DETAIL))
    }
  }

  return {
    file: path.relative(ROOT, filePath),
    hits: rects.map((r) => r.text),
  }
}

const scanTargets = targets.length ? targets : ['public/appui-images']
const files = []
for (const t of scanTargets) files.push(...(await listImages(t)))

console.log(`${apply ? 'redact' : 'scan'} ${files.length} images literals=${JSON.stringify(literals)}`)
const changed = []
let i = 0
for (const file of files) {
  i += 1
  try {
    const result = await processFile(file)
    if (result) {
      changed.push(result)
      console.log(`${i}/${files.length} HIT ${result.file} ${JSON.stringify(result.hits)}`)
    } else if (i % 50 === 0) {
      console.log(`${i}/${files.length}`)
    }
  } catch (error) {
    console.warn(`${i}/${files.length} skip ${path.relative(ROOT, file)}: ${error instanceof Error ? error.message : error}`)
  }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'scan', files: files.length, hits: changed.length, changed }, null, 2))
