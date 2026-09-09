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
  return `/appui-images/${path.basename(destDir)}/${stem}.webp`
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
    appId: 'tomostudy-1788697361923-zxy7',
    inbox: 'inbox/tomoStudy',
    folder: 'tomostudy',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タイマー'],
    rules: [
      ['オンボーディング', [/ようこそ/, /アカウント/, /はじめる/, /始める/, /ログイン/, /会員登録/]],
      ['ホーム・自習室', [/自習室/, /勉強中/, /ルーム/, /参加者/, /オンライン/]],
      ['タイマー・セッション', [/タイマー/, /分残り/, /ポモドーロ/, /休憩/, /セッション/]],
      ['ランキング・統計', [/ランキング/, /ランク/, /統計/, /合計時間/, /勉強時間/]],
      ['プロフィール・設定', [/プロフィール/, /設定/, /通知/, /プレミアム/, /課金/, /プラン/]],
    ],
  },
  {
    appId: 'shuchu-1788697378168-8x8z',
    inbox: 'inbox/集中',
    folder: 'shuchu',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タイマー', 'グラフ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /許可/]],
      ['ホーム・タイマー', [/集中/, /タイマー/, /スタート/, /開始/, /停止/, /ポモドーロ/]],
      ['記録・統計', [/記録/, /統計/, /グラフ/, /カレンダー/, /履歴/, /レポート/]],
      ['ブロック・制限', [/ブロック/, /制限/, /アプリ制限/, /スクリーンタイム/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'focus-to-do-1788697391444-2w4w',
    inbox: 'inbox/Focus To-Do',
    folder: 'focus-to-do',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タイマー', 'チェック'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['タスク', [/タスク/, /To-?Do|ToDo|Todo/i, /今日/, /予定/, /完了/, /チェック/]],
      ['ポモドーロ', [/ポモドーロ/, /Focus/, /タイマー/, /休憩/, /集中/]],
      ['統計', [/統計/, /レポート/, /グラフ/, /記録/, /履歴/]],
      ['カレンダー', [/カレンダー/, /日程/]],
      ['設定', [/設定/, /プレミアム/, /テーマ/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'forest-1788697401597-juga',
    inbox: 'inbox/Forest',
    folder: 'forest',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タイマー'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['植林・タイマー', [/植える/, /植林/, /タイマー/, /集中/, /木を/, /スタート/, /開始/]],
      ['森・コレクション', [/森/, /コレクション/, /図鑑/, /ツリー/, /品種/]],
      ['タイムライン・統計', [/タイムライン/, /統計/, /記録/, /履歴/, /カレンダー/]],
      ['ストア・友達', [/ストア/, /ショップ/, /友達/, /フレンド/, /タグ/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/, /プロフィール/]],
    ],
  },
  {
    appId: 'dothabit-1788697412769-7s68',
    inbox: 'inbox/DotHabit',
    folder: 'dothabit',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー', 'グラフ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・記録', [/習慣/, /ドット/, /記録する/, /できた/, /ホーム/]],
      ['カレンダー', [/カレンダー/, /月間/, /年間/]],
      ['統計・グラフ', [/統計/, /グラフ/, /レポート/, /分析/]],
      ['習慣編集', [/追加/, /編集/, /新規/, /作成/, /リマインダー/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/, /テーマ/]],
    ],
  },
  {
    appId: 'mainichi-mame-1788697420905-b5ki',
    inbox: 'inbox/毎日まめ',
    folder: 'mainichi-mame',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・記録', [/まめ/, /気分/, /記録/, /今日/, /ホーム/, /日記/]],
      ['カレンダー', [/カレンダー/, /月別/, /年間/]],
      ['タイムライン・一覧', [/タイムライン/, /一覧/, /履歴/, /過去/]],
      ['統計', [/統計/, /グラフ/, /レポート/, /分析/]],
      ['設定', [/設定/, /プレミアム/, /通知/, /アカウント/, /テーマ/, /バックアップ/]],
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
    // Keep contiguous flow: if OCR fails, stick with previous section
    if (title === 'その他' && order.length) {
      const prev = order[order.length - 1]
      title = prev
    }
    if (!grouped.has(title)) grouped.set(title, [])
    grouped.get(title).push(stem)
    order.push(title)
  }
  process.stdout.write('\n')

  // Preserve first-seen section order
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
console.log('\nDONE')
console.log(JSON.stringify(report, null, 2))
