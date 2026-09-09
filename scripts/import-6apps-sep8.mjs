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
    appId: 'yanjan-plus-1788875141022-1c77',
    inbox: 'inbox/ヤンジャン+',
    folder: 'yanjan-plus',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'タブ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・おすすめ', [/ホーム/, /おすすめ/, /ランキング/, /無料/, /連載/]],
      ['作品・閲覧', [/話/, /読む/, /続き/, /作品/, /マンガ/]],
      ['本棚・マイページ', [/本棚/, /マイページ/, /履歴/, /お気に入り/]],
      ['検索', [/検索/, /ジャンル/]],
      ['設定', [/設定/, /アカウント/, /コイン/, /購入/]],
    ],
  },
  {
    appId: 'chargespot-1788875154937-q78w',
    inbox: 'inbox/CHARGESPOT',
    folder: 'chargespot',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '地図', '検索'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['マップ・検索', [/マップ/, /地図/, /検索/, /近く/, /スポット/]],
      ['レンタル・返却', [/レンタル/, /返却/, /充電/, /バッテリー/, /借り/]],
      ['履歴・決済', [/履歴/, /決済/, /支払い/, /カード/]],
      ['設定', [/設定/, /アカウント/, /ヘルプ/, /お知らせ/]],
    ],
  },
  {
    appId: 'weathernews-1788875165119-d14q',
    inbox: 'inbox/weathernews',
    folder: 'weathernews',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '地図', 'グラフ'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /許可/]],
      ['ホーム・天気', [/天気/, /気温/, /降水/, /ホーム/, /今日/]],
      ['レーダー・地図', [/レーダー/, /雨雲/, /地図/, /マップ/]],
      ['予報・詳細', [/予報/, /週間/, /時間/, /詳細/]],
      ['お知らせ・防災', [/防災/, /警報/, /地震/, /お知らせ/]],
      ['設定', [/設定/, /通知/, /アカウント/, /地点/]],
    ],
  },
  {
    appId: 'eight-1788875175432-r7i6',
    inbox: 'inbox/Eight',
    folder: 'eight',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /新規会員/]],
      ['名刺撮影・交換', [/名刺/, /撮影/, /交換/, /スキャン/, /両面/]],
      ['ホーム・フィード', [/ホーム/, /近況/, /フィード/, /知り合い/]],
      ['プロフィール・人物', [/プロフィール/, /さん/, /勤務/, /会社/]],
      ['検索', [/検索/, /探す/]],
      ['設定', [/設定/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'kurashiru-1788875185106-yiqf',
    inbox: 'inbox/クラシル',
    folder: 'kurashiru',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', '動画'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/]],
      ['ホーム・おすすめ', [/ホーム/, /おすすめ/, /人気/, /今日/]],
      ['レシピ・詳細', [/レシピ/, /材料/, /作り方/, /分/]],
      ['検索', [/検索/, /カテゴリ/, /献立/]],
      ['保存・マイページ', [/保存/, /マイページ/, /お気に入り/, /履歴/]],
      ['設定', [/設定/, /アカウント/, /通知/]],
    ],
  },
  {
    appId: 'mynavi-2028-1788875197580-otvm',
    inbox: 'inbox/マイナビ2028',
    folder: 'mynavi-2028',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /おねがい/]],
      ['登録・プロフィール', [/登録/, /学校/, /基本情報/, /姓名/, /パスワード/]],
      ['ホーム', [/ホーム/, /マイページ/, /お知らせ/]],
      ['企業検索・一覧', [/検索/, /企業/, /インターン/, /検討リスト/, /エントリー/]],
      ['企業詳細', [/企業情報/, /募集/, /説明会/, /エントリーシート/]],
      ['イベント・メッセージ', [/イベント/, /メッセージ/, /説明会/]],
      ['設定', [/設定/, /アカウント/, /通知/]],
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
