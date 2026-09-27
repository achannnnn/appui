#!/usr/bin/env node
/**
 * Resume whiteout for 天野 / 伊丹市 on the scanned hit list.
 * Usage: node scripts/resume-amano-itami.mjs [--apply]
 */
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LIST = path.join(ROOT, 'scripts/resume/amano-itami-files.txt')
const DONE = path.join(ROOT, 'scripts/resume/amano-itami-done.txt')
const apply = process.argv.includes('--apply')

async function smokeOcr() {
  const bin = path.join(ROOT, 'scripts/ocr-text')
  const probe = path.join(ROOT, 'public/appui-images/didi/IMG_1140.webp')
  const tmp = path.join(ROOT, '.ocr-smoke.png')
  await new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [
        '--input-type=module',
        '-e',
        `import sharp from 'sharp'; await sharp(process.argv[1],{animated:false}).rotate().resize({width:800,withoutEnlargement:true}).png().toFile(process.argv[2])`,
        probe,
        tmp,
      ],
      { cwd: ROOT, stdio: 'ignore' },
    )
    child.on('error', reject)
    child.on('close', (code) => (code ? reject(new Error('png convert failed')) : resolve()))
  })
  const out = await new Promise((resolve) => {
    const child = spawn(bin, [tmp], { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))
    child.on('close', (code) => resolve({ code, stdout, stderr }))
  })
  await fs.unlink(tmp).catch(() => {})
  if (out.code !== 0 || /ocr failed|nilError|CVPixelBuffer/i.test(out.stderr)) {
    return { ok: false, error: (out.stderr || out.stdout || 'ocr failed').trim() }
  }
  return { ok: true }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => (code ? reject(new Error(`${cmd} exited ${code}`)) : resolve()))
  })
}

const smoke = await smokeOcr()
if (!smoke.ok) {
  console.log(JSON.stringify({ ready: false, error: smoke.error }, null, 2))
  process.exit(2)
}

const all = (await fs.readFile(LIST, 'utf8'))
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
let done = new Set()
try {
  done = new Set(
    (await fs.readFile(DONE, 'utf8'))
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  )
} catch {}
const pending = all.filter((f) => !done.has(f))
console.log(JSON.stringify({ ready: true, total: all.length, done: done.size, pending: pending.length, apply }, null, 2))
if (!pending.length) {
  process.exit(0)
}
if (!apply) {
  process.exit(0)
}

const args = [
  path.join(ROOT, 'scripts/redact-literals-only.mjs'),
  '--apply',
  '--literal',
  '天野',
  '--literal',
  '伊丹市',
  ...pending,
]
await run('node', args)
await fs.writeFile(DONE, `${[...done, ...pending].join('\n')}\n`)
console.log(JSON.stringify({ completed: pending.length, doneFile: path.relative(ROOT, DONE) }, null, 2))
