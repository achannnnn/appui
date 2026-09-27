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
    appId: 'tone-1789304031118-l1ro',
    inbox: 'inbox/tone',
    folder: 'tone',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /スキップ/, /ログイン/]],
      ['ホーム・ライブラリ', [/ライブラリ/, /アルバム/, /写真を選/, /最近の項目/, /カメラロール/]],
      ['編集', [/編集/, /切り抜き/, /回転/, /調整/, /明るさ/, /コントラスト/]],
      ['フィルター・効果', [/フィルター/, /効果/, /トーン/, /フィルム/, /プリセット/]],
      ['書き出し・共有', [/書き出し/, /保存/, /共有/, /エクスポート/, /投稿/]],
      ['設定', [/設定/, /アカウント/, /プレミアム/, /購入/, /サブスク/]],
    ],
  },
  {
    appId: 'cookpad-1789304042897-coyj',
    inbox: 'inbox/クックパッド',
    folder: 'cookpad',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター', 'ボトム ナビゲーション'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /ログイン/, /新規登録/]],
      ['ホーム', [/おすすめ/, /人気/, /トレンド/, /フィード/, /今日の/]],
      ['検索', [/検索/, /キーワード/, /カテゴリ/, /絞り込み/, /材料/]],
      ['レシピ詳細', [/材料/, /作り方/, /手順/, /つくれぽ/, /分量/, /人分/]],
      ['献立・買い物', [/献立/, /買い物/, /リスト/, /ストック/]],
      ['投稿・つくれぽ', [/投稿/, /つくれぽ/, /写真を追加/, /公開/]],
      ['マイページ・設定', [/マイページ/, /プロフィール/, /設定/, /お気に入り/, /フォロー/]],
    ],
  },
  {
    appId: 'routinery-1789304053988-ormv',
    inbox: 'inbox/Routinery',
    folder: 'routinery',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ', 'フォーム'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /スキップ/, /ログイン/]],
      ['ホーム・ルーティン', [/ルーティン/, /今日/, /習慣/, /ホーム/, /朝の/, /夜の/]],
      ['追加・編集', [/追加/, /編集/, /作成/, /リマインダー/, /時間を設定/]],
      ['統計・カレンダー', [/統計/, /カレンダー/, /グラフ/, /連続/, /達成/, /履歴/]],
      ['設定', [/設定/, /アカウント/, /通知/, /プレミアム/, /テーマ/]],
    ],
  },
  {
    appId: 'ticktick-1789304107640-8yzg',
    inbox: 'inbox/TickTick',
    folder: 'ticktick',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー', 'フォーム', 'ボトム ナビゲーション'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /スキップ/, /ログイン/]],
      ['タスク一覧', [/タスク/, /今日/, /明日/, /リスト/, /完了/, /To-?Do|Todo/i]],
      ['カレンダー', [/カレンダー/, /週間/, /月間/, /スケジュール/]],
      ['習慣・ポモドーロ', [/習慣/, /ポモドーロ/, /タイマー/, /フォーカス/, /集中/]],
      ['追加・編集', [/追加/, /編集/, /新規/, /期限/, /優先度/, /リマインダー/]],
      ['設定', [/設定/, /アカウント/, /通知/, /プレミアム/, /テーマ/, /プロフィール/]],
    ],
  },
  {
    appId: 'ameba-1787963566327-vdsx',
    inbox: 'inbox/Ameba',
    folder: 'ameba',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'タブ', 'ボトム ナビゲーション'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /ログイン/, /新規登録/]],
      ['ホーム・タイムライン', [/タイムライン/, /ホーム/, /フォロー中/, /おすすめ/, /ピックス/]],
      ['ブログ', [/ブログ/, /記事/, /エントリー/, /下書き/, /投稿する/]],
      ['メッセージ', [/メッセージ/, /チャット/, /DM/, /受信箱/]],
      ['ピグ・コミュニティ', [/ピグ/, /コミュニティ/, /ゲーム/, /アバター/]],
      ['プロフィール', [/プロフィール/, /マイページ/, /フォロワー/, /フォロー/]],
      ['設定', [/設定/, /アカウント/, /通知/, /プライバシー/, /ヘルプ/]],
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
