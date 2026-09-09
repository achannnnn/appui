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
    appId: 'minchalle-1788788144575-wypp',
    inbox: 'inbox/みんチャレ',
    folder: 'minchalle',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー', 'グラフ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /登録/]],
      ['ホーム', [/チャレンジ/, /ホーム/, /今日/, /継続/]],
      ['記録・投稿', [/投稿/, /記録/, /チェックイン/, /写真/]],
      ['ランキング・仲間', [/ランキング/, /仲間/, /メンバー/, /チーム/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/, /プロフィール/]],
    ],
  },
  {
    appId: 'komeda-1788788152444-6vor',
    inbox: 'inbox/コメダ珈琲',
    folder: 'komeda',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '地図', '検索'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム', [/ホーム/, /くつろ/, /ステージ/, /ランク/]],
      ['店舗・マップ', [/店舗/, /地図/, /マップ/, /ご利用店舗/, /近/, /検索/]],
      ['メニュー・オーダー', [/メニュー/, /オーダー/, /注文/, /カート/]],
      ['コメカ・会員', [/コメカ/, /KOMECA/, /ポイント/, /会員/]],
      ['設定', [/設定/, /お知らせ/, /アレルギー/, /アカウント/]],
    ],
  },
  {
    appId: 'blockin-1788788161447-g566',
    inbox: 'inbox/Blockin',
    folder: 'blockin',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タイマー'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /許可/]],
      ['ホーム・制限', [/ブロック/, /制限/, /スクリーンタイム/, /ホーム/, /ロック/]],
      ['タイマー・集中', [/タイマー/, /集中/, /セッション/, /開始/]],
      ['統計', [/統計/, /記録/, /グラフ/, /履歴/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'line-manga-1788788171225-oupz',
    inbox: 'inbox/LINEマンガ',
    folder: 'line-manga',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'タブ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・おすすめ', [/ホーム/, /おすすめ/, /ランキング/, /無料/]],
      ['作品・閲覧', [/話/, /読む/, /続き/, /作品/, /マンガ/]],
      ['本棚・マイページ', [/本棚/, /マイページ/, /履歴/, /お気に入り/]],
      ['検索', [/検索/, /ジャンル/]],
      ['設定', [/設定/, /アカウント/, /コイン/, /購入/]],
    ],
  },
  {
    appId: 'piccoma-1788788182626-6r3o',
    inbox: 'inbox/ピッコマ',
    folder: 'piccoma',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'タブ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・おすすめ', [/ホーム/, /おすすめ/, /ランキング/, /無料/, /毎日/]],
      ['作品・閲覧', [/話/, /読む/, /続き/, /作品/, /マンガ/]],
      ['本棚・マイページ', [/本棚/, /マイページ/, /履歴/, /チケット/]],
      ['検索', [/検索/, /ジャンル/]],
      ['設定', [/設定/, /アカウント/, /コイン/, /購入/]],
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
    const stem = path.basename(src, path.extname(src))
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
