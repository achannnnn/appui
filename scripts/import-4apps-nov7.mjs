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
    appId: 'campus-1794033030755-by3t',
    inbox: 'inbox/キャンパス',
    folder: 'campus',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター', 'プロフィール'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /ログイン/, /新規/]],
      ['ホーム', [/ホーム/, /タイムライン/, /おすすめ/, /お知らせ/]],
      ['検索・一覧', [/検索/, /企業/, /求人/, /インターン/, /スカウト/]],
      ['詳細', [/企業情報/, /募集/, /詳細/, /会社概要/]],
      ['メッセージ', [/メッセージ/, /チャット/, /トーク/]],
      ['プロフィール', [/プロフィール/, /経歴/, /学歴/, /自己PR/]],
      ['設定', [/設定/, /アカウント/, /通知/, /ヘルプ/]],
    ],
  },
  {
    appId: 'kyujin-box-1794033031436-6ji1',
    inbox: 'inbox/求人ボックス',
    folder: 'kyujin-box',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/]],
      ['求人検索', [/検索/, /条件/, /エリア/, /職種/, /こだわり/]],
      ['求人一覧', [/件/, /求人/, /リスト/, /並び替え/]],
      ['求人詳細', [/詳細/, /応募/, /給与/, /勤務地/, /会社/]],
      ['保存・履歴', [/保存/, /気になる/, /履歴/, /閲覧/]],
      ['マイページ・設定', [/マイページ/, /設定/, /プロフィール/, /通知/]],
    ],
  },
  {
    appId: 'standby-1794033032183-3g2e',
    inbox: 'inbox/スタンバイ',
    folder: 'standby',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/]],
      ['求人検索', [/検索/, /条件/, /エリア/, /職種/, /こだわり/]],
      ['求人一覧', [/件/, /求人/, /リスト/, /並び替え/]],
      ['求人詳細', [/詳細/, /応募/, /給与/, /勤務地/, /会社/]],
      ['保存・履歴', [/保存/, /気になる/, /履歴/, /閲覧/]],
      ['マイページ・設定', [/マイページ/, /設定/, /プロフィール/, /通知/]],
    ],
  },
  {
    appId: 'satofuru-1794033032669-11tz',
    inbox: 'inbox/さとふる',
    folder: 'satofuru',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /特集/, /人気/]],
      ['検索・一覧', [/検索/, /返礼品/, /カテゴリ/, /ランキング/]],
      ['返礼品詳細', [/詳細/, /寄付/, /返礼/, /自治体/]],
      ['カート・寄付', [/カート/, /寄付する/, /決済/, /申し込み/]],
      ['マイページ', [/マイページ/, /寄付履歴/, /お気に入り/, /控除/]],
      ['設定', [/設定/, /アカウント/, /通知/, /ヘルプ/]],
    ],
  },
  {
    appId: 'crowdworks-1794039824516-674e',
    inbox: 'inbox/クラウドワークス',
    folder: 'crowdworks',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/, /新規/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/, /お仕事/]],
      ['仕事検索', [/検索/, /カテゴリ/, /条件/, /絞り込み/]],
      ['仕事一覧', [/件/, /仕事/, /募集/, /リスト/]],
      ['仕事詳細', [/詳細/, /応募/, /報酬/, /納期/, /クライアント/]],
      ['メッセージ', [/メッセージ/, /チャット/, /やり取り/]],
      ['マイページ・設定', [/マイページ/, /プロフィール/, /設定/, /通知/, /売上/]],
    ],
  },
]

async function listImages(dir) {
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
  let files = []
  try {
    files = await listImages(inboxDir)
  } catch {
    console.warn(`inbox missing: ${spec.inbox}`)
    continue
  }

  const grouped = new Map()
  const order = []

  console.log(`\n== ${path.basename(spec.inbox)} (${files.length}) ==`)
  if (files.length === 0) {
    report.push({ name: path.basename(spec.inbox), converted: 0, sections: {} })
    continue
  }

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
  app.sections = deviceSections
  app.components = [...new Set([...(app.components || []), ...spec.components])]

  const summary = Object.fromEntries([...grouped.entries()].map(([k, v]) => [k, v.length]))
  report.push({ name: app.name, converted: files.length, sections: summary })
  console.log(app.name, summary)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log('\nDONE_IMPORT')
console.log(JSON.stringify(report, null, 2))
