import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'inbox/レアジョブ')
const DST = path.join(ROOT, 'public/appui-images/rarejob')
const LIST = 600
const DETAIL = 1200

async function toMasterWebp(buffer) {
  return sharp(buffer, { animated: false })
    .rotate()
    .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 90, alphaQuality: 90, effort: 4, smartSubsample: false })
    .toBuffer()
}

const names = (await fs.readdir(SRC))
  .filter((n) => /^IMG_\d+\.PNG$/i.test(n))
  .sort()

for (const name of names) {
  const stem = name.replace(/\.PNG$/i, '')
  const buf = await fs.readFile(path.join(SRC, name))
  const master = await toMasterWebp(buf)
  const out = path.join(DST, `${stem}.webp`)
  await fs.writeFile(out, master)
  await fs.writeFile(path.join(DST, `${stem}.list.webp`), await toDisplayWebp(master, LIST))
  await fs.writeFile(path.join(DST, `${stem}.detail.webp`), await toDisplayWebp(master, DETAIL))
  console.log('reconverted', stem)
}

console.log(`done ${names.length} images`)
