import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const OCR_BIN = path.join(ROOT, 'scripts/ocr-text')
const LIST = 600
const DETAIL = 1200
const Q = 90

function uid(len = 7) {
  const c = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += c[(Math.random() * c.length) | 0]
  return s
}

function safeStem(name) {
  return String(name)
    .replace(/\s+2$/i, '-2')
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._\u3040-\u30ff\u3400-\u9fff\-]/g, '')
}

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
    .webp({ quality: Q, alphaQuality: Q, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function convertPng(srcPath, destDir, stem) {
  await fs.mkdir(destDir, { recursive: true })
  const master = await toMasterWebp(await fs.readFile(srcPath))
  await fs.writeFile(path.join(destDir, `${stem}.webp`), master)
  await fs.writeFile(path.join(destDir, `${stem}.list.webp`), await toDisplayWebp(master, LIST))
  await fs.writeFile(path.join(destDir, `${stem}.detail.webp`), await toDisplayWebp(master, DETAIL))
}

function runOcr(filePath) {
  return new Promise((resolve) => {
    const child = spawn(OCR_BIN, [filePath], { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    child.stdout.on('data', (c) => (out += c))
    child.on('close', () => {
      try {
        const boxes = JSON.parse(out || '[]')
        resolve(Array.isArray(boxes) ? boxes.map((b) => String(b.text || '')).join('\n') : '')
      } catch {
        resolve('')
      }
    })
    child.on('error', () => resolve(''))
  })
}

function matchSection(text, rules) {
  const t = String(text || '')
  for (const [title, patterns] of rules) {
    if (patterns.some((p) => (p instanceof RegExp ? p.test(t) : t.includes(p)))) return title
  }
  return 'その他'
}

function mkImage(src, components) {
  return { id: uid(), src, filename: path.basename(src), components }
}

function section(title, stems, folderPrefix, components) {
  return {
    id: uid(),
    title,
    images: stems.map((stem) => mkImage(`${folderPrefix}/${stem}.webp`, components)),
  }
}

const BATCH = [
  {
    appId: 'careertas-1788967946396-nzr0',
    inbox: 'inbox/キャリタス',
    folder: 'careertas',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /ログイン/, /新規/]],
      ['登録・プロフィール', [/登録/, /学校/, /基本情報/, /プロフィール/, /姓名/]],
      ['ホーム', [/ホーム/, /マイページ/, /お知らせ/, /おすすめ/]],
      ['企業検索・一覧', [/検索/, /企業/, /インターン/, /検討/, /エントリー/, /求人/]],
      ['企業詳細', [/企業情報/, /募集/, /説明会/, /会社概要/, /採用/]],
      ['イベント・メッセージ', [/イベント/, /メッセージ/, /説明会/]],
      ['設定', [/設定/, /アカウント/, /通知/, /ヘルプ/]],
    ],
  },
  {
    appId: 'webgym-1788967954888-ntpc',
    inbox: 'inbox/WEBGYM',
    folder: 'webgym',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タブ', 'グラフ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム・トレーニング', [/ホーム/, /トレーニング/, /ワークアウト/, /運動/, /メニュー/]],
      ['レッスン・動画', [/レッスン/, /動画/, /再生/, /コース/]],
      ['記録・グラフ', [/記録/, /履歴/, /グラフ/, /カロリー/, /体重/]],
      ['マイページ・設定', [/マイページ/, /設定/, /アカウント/, /プロフィール/, /通知/]],
    ],
  },
  {
    appId: 'roughly-1788967963485-acbf',
    inbox: 'inbox/Roughly',
    folder: 'roughly',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ', 'フォーム'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム・収支', [/ホーム/, /支出/, /収入/, /今月/, /合計/]],
      ['入力・登録', [/入力/, /追加/, /登録/, /カテゴリ/, /メモ/]],
      ['グラフ・分析', [/グラフ/, /分析/, /内訳/, /推移/]],
      ['設定', [/設定/, /アカウント/, /通知/, /バックアップ/]],
    ],
  },
  {
    appId: 'zaim-1788967972508-czny',
    inbox: 'inbox/Zaim',
    folder: 'zaim',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ', 'タブ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム・収支', [/ホーム/, /支出/, /収入/, /今月/, /残高/]],
      ['入力・明細', [/入力/, /明細/, /追加/, /カテゴリ/, /メモ/]],
      ['グラフ・レポート', [/グラフ/, /レポート/, /分析/, /内訳/, /推移/]],
      ['口座・予算', [/口座/, /予算/, /目標/, /貯金/]],
      ['設定', [/設定/, /アカウント/, /通知/, /連携/]],
    ],
  },
]

async function listPngs(dir) {
  const names = await fs.readdir(dir)
  return names
    .filter((n) => /\.(png|jpe?g|heic|webp)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((n) => path.join(dir, n))
}

const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const report = []

for (const spec of BATCH) {
  const inboxDir = path.join(ROOT, spec.inbox)
  const destDir = path.join(ROOT, 'public/appui-images', spec.folder)
  const files = await listPngs(inboxDir)
  const grouped = new Map()
  const order = []

  console.log(`\n== ${path.basename(spec.inbox)} (${files.length}) ==`)
  let i = 0
  for (const src of files) {
    i++
    const rawStem = path.basename(src, path.extname(src))
    const stem = safeStem(rawStem)
    process.stdout.write(`\r  ${i}/${files.length} ${stem}   `)
    await convertPng(src, destDir, stem)
    const text = await runOcr(src)
    let title = matchSection(text, spec.rules)
    if (title === 'その他' && order.length) title = order[order.length - 1]
    if (!grouped.has(title)) grouped.set(title, [])
    grouped.get(title).push(stem)
    order.push(title)
  }
  process.stdout.write('\n')

  const titles = [...new Set(order)]
  const folderPrefix = `/appui-images/${spec.folder}`
  const deviceSections = titles.map((title) =>
    section(title, grouped.get(title), folderPrefix, spec.components.slice(0, 5)),
  )

  const idx = apps.findIndex((a) => a.id === spec.appId)
  if (idx < 0) {
    console.warn(`app not found: ${spec.appId}`)
    continue
  }
  const app = apps[idx]
  const store = app.sections.find((s) => s.title === 'ストア画像') || app.sections[0]
  app.sections = [store, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]

  const summary = Object.fromEntries([...grouped.entries()].map(([k, v]) => [k, v.length]))
  report.push({ name: app.name, converted: files.length, sections: summary })
  console.log(app.name, summary)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log('\nDONE_IMPORT')
console.log(JSON.stringify(report, null, 2))
