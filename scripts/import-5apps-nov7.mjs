/**
 * Import today's 5 inbox apps and blur personal info:
 * 天野健司 / email / 伊丹市鈴原町 / company names.
 *
 * node scripts/import-5apps-nov7.mjs
 */
import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const OCR_BIN = path.join(ROOT, 'scripts/ocr-text')
const LIST = 600
const DETAIL = 1200
const Q = 90
const BLUR = 28
const PAD_X = 0.02
const PAD_Y = 0.012

const GENRE_TO_CATEGORY = {
  'ソーシャルネットワーキング': 'ソーシャル ネットワーキング',
  'Social Networking': 'ソーシャル ネットワーキング',
  Utilities: '仕事効率化',
  ユーティリティ: '仕事効率化',
  Productivity: '仕事効率化',
  仕事効率化: '仕事効率化',
  Business: '仕事効率化',
  ビジネス: '仕事効率化',
  Lifestyle: 'ライフスタイル',
  ライフスタイル: 'ライフスタイル',
}

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

function truncate(text, max = 120) {
  const n = String(text || '').replace(/\s+/g, ' ').trim()
  if (n.length <= max) return n
  return `${n.slice(0, max).trim()}…`
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', reject)
    child.on('close', (code) => (code ? reject(new Error(err || `${cmd} failed`)) : resolve(out)))
  })
}

async function toMasterWebp(buffer) {
  return sharp(buffer, { animated: false })
    .rotate()
    .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .resize({ width: maxWidth, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
    .webp({ quality: Q, alphaQuality: Q, effort: 4, smartSubsample: false })
    .toBuffer()
}

async function ocrBuffer(buffer) {
  const tmp = path.join(os.tmpdir(), `appui-ocr-${process.pid}-${Date.now()}.png`)
  await sharp(buffer, { animated: false })
    .resize({ width: 1200, withoutEnlargement: true })
    .png()
    .toFile(tmp)
  try {
    return JSON.parse((await run(OCR_BIN, [tmp])) || '[]')
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }
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

const NAME_RE =
  /天野|健司|アマノ|ケンジ|けんじ|amano\s*kenji|amanokenji|\bkenji\b|\bamano\b|さとう|たかし|サトウ|タカシ|佐藤/i
const EMAIL_RE = /[A-Za-z0-9*＊._%+\-]{1,}[@＠][A-Za-z0-9*＊.\-]{1,}\.[A-Za-z]{2,}/
const ADDRESS_RE = /鈴原/
const BIRTH_RE = /1995年\s*0?7月\s*0?28日|平成\s*7年\s*7月\s*28日|1995[\/\-.]0?7[\/\-.]28/
const COMPANY_RE =
  /(?:株式会社|有限会社|合同会社|合資会社|（株）|\(株\))[^\s、。]{0,24}|[^\s、。]{1,24}(?:株式会社|有限会社|合同会社|合資会社)/
const MOBILE_RE = /0[789]0[-‐−ー\s]?\d{4}[-‐−ー\s]?\d{4}/
const LABEL_COMPANY = /^(企業名|会社名|勤務先|所属企業|所属)(\s*[*＊※])?$/
const LABEL_NAME =
  /^(氏名|お名前|名前|姓名|氏名かな|ふりがな|フリガナ|表示用の名前|ニックネーム|ユーザー名|ユーザ名)(\s*[*＊※])?$/
const LABEL_MAIL = /^(メールアドレス|メール|Eメール|Email)(\s*[*＊※])?$/i
const LABEL_ADDRESS = /^(住所|ご住所|お届け先|郵便番号)(\s*[*＊※])?$/
const LABEL_BIRTH = /^(生年月日|誕生日)(\s*[*＊※])?$/
const UI_TEXT =
  /^(非公開|公開|編集する|変更する|男性|女性|その他|未回答|選択|未入力|未設定|新卒|中途|回答しない|編集|削除|追加|保存|現在|任意|必須|次へ|戻る|完了|登録|変更|確認|キャンセル|閉じる|都道府県|市区町村)$/

function boxTop(b) {
  return 1 - b.y - b.h
}

function companySpan(text) {
  const m = String(text || '').match(COMPANY_RE)
  return m ? m[0] : ''
}

function isPlaceholderEmail(text) {
  return /example\.com|xxxxx@|hanako@|sample@|satofull\.co\.jp|bizreach\.co\.jp|oubo\.net/i.test(text)
}

function isPlaceholderPhone(text) {
  const digits = String(text || '').replace(/\D/g, '')
  return digits === '09012345678' || digits === '08012345678' || digits === '0312345678'
}

function isCompanyBox(text) {
  const t = String(text || '').trim()
  if (!t || LABEL_COMPANY.test(t) || UI_TEXT.test(t)) return false
  if (/本規約|利用規約|プライバシー|以下「/.test(t)) return false
  if (/^(企業を探す|企業検索|企業情報|会社概要|企業一覧|注目企業|企業ページ)$/.test(t)) return false
  const span = companySpan(t)
  if (!span) return false
  if (t.length > 42 && span.length / t.length < 0.4) return false
  return true
}

function isNameBox(text) {
  const t = String(text || '').trim()
  if (!t || UI_TEXT.test(t) || LABEL_NAME.test(t)) return false
  if (/アプリユーアイ/.test(t)) return true
  if (/ID\s*[:：]\s*\d{6,}/i.test(t)) return true
  return NAME_RE.test(t)
}

function looksLikePersonValue(text) {
  const t = String(text || '').trim()
  if (!t || UI_TEXT.test(t) || LABEL_NAME.test(t) || LABEL_MAIL.test(t) || LABEL_BIRTH.test(t)) return false
  if (isNameBox(t)) return true
  return /^[ぁ-んァ-ンー一-龥A-Za-z・\s　]{2,24}$/.test(t) && !/設定|通知|カメラ|マイク|デザイナー/.test(t)
}

function isEmailBox(text) {
  const t = String(text || '').trim()
  if (!t || LABEL_MAIL.test(t) || isPlaceholderEmail(t)) return false
  if (/kanaeryou|amanokenji/i.test(t)) return true
  return EMAIL_RE.test(t)
}

function isAddressBox(text) {
  const t = String(text || '').trim()
  if (!t || LABEL_ADDRESS.test(t)) return false
  return ADDRESS_RE.test(t)
}

function isBirthBox(text) {
  const t = String(text || '').trim()
  if (!t || LABEL_BIRTH.test(t)) return false
  return BIRTH_RE.test(t.replace(/\s/g, ''))
}

function isMobileBox(text) {
  const t = String(text || '').trim()
  if (!t || isPlaceholderPhone(t)) return false
  return MOBILE_RE.test(t.replace(/\s/g, ''))
}

function valuesNearLabel(boxes, labelRe) {
  const hits = []
  for (const label of boxes) {
    const lt = String(label.text || '').trim()
    if (!labelRe.test(lt) || lt.length > 18) continue
    const lTop = boxTop(label)
    for (const b of boxes) {
      if (b === label) continue
      const t = String(b.text || '').trim()
      if (!t || UI_TEXT.test(t) || labelRe.test(t)) continue
      if (t.length > 60) continue
      const top = boxTop(b)
      const sameRow = b.x >= label.x + Math.min(label.w * 0.45, 0.08) && Math.abs(top - lTop) < 0.028
      const below =
        top >= lTop + label.h * 0.35 &&
        top - lTop < 0.055 &&
        b.x < label.x + 0.42 &&
        b.x + b.w > label.x - 0.03
      if (sameRow || below) hits.push(b)
    }
  }
  return hits
}

function collectHits(boxes) {
  const hits = []
  const seen = new Set()
  function add(box, kind) {
    const key = `${kind}:${box.x.toFixed(4)}:${box.y.toFixed(4)}:${String(box.text || '').slice(0, 40)}`
    if (seen.has(key)) return
    seen.add(key)
    hits.push({ box, kind, text: String(box.text || '').trim() })
  }
  for (const box of boxes) {
    const t = String(box.text || '')
    if (isNameBox(t)) add(box, 'name')
    else if (isEmailBox(t)) add(box, 'email')
    else if (isAddressBox(t)) add(box, 'address')
    else if (isBirthBox(t)) add(box, 'birth')
    else if (isCompanyBox(t)) add(box, 'company')
    else if (isMobileBox(t)) add(box, 'phone')
  }
  for (const box of valuesNearLabel(boxes, LABEL_COMPANY)) {
    if (isCompanyBox(box.text) || looksLikePersonValue(box.text)) add(box, 'company')
  }
  for (const box of valuesNearLabel(boxes, LABEL_NAME)) {
    if (looksLikePersonValue(box.text)) add(box, 'name')
  }
  for (const box of valuesNearLabel(boxes, /^(表示用の名前|ニックネーム|ユーザー名|ユーザ名)$/)) {
    const t = String(box.text || '').trim()
    if (t && !UI_TEXT.test(t) && !LABEL_NAME.test(t)) add(box, 'name')
  }
  for (const box of valuesNearLabel(boxes, LABEL_MAIL)) {
    if (isEmailBox(box.text)) add(box, 'email')
  }
  for (const box of valuesNearLabel(boxes, LABEL_ADDRESS)) {
    if (isAddressBox(box.text)) add(box, 'address')
  }
  for (const box of valuesNearLabel(boxes, LABEL_BIRTH)) {
    if (isBirthBox(box.text) || /[12]\d{3}年/.test(String(box.text || ''))) add(box, 'birth')
  }
  return hits
}

function toRect(box, W, H) {
  const x = Math.max(0, Math.round((box.x - PAD_X) * W))
  const y = Math.max(0, Math.round((1 - box.y - box.h - PAD_Y) * H))
  const w = Math.min(W - x, Math.round((box.w + PAD_X * 2) * W))
  const h = Math.min(H - y, Math.round((box.h + PAD_Y * 2) * H))
  if (w < 4 || h < 4) return null
  return { x, y, w, h }
}

async function blurMaster(master, hits) {
  const meta = await sharp(master).metadata()
  const W = meta.width || 0
  const H = meta.height || 0
  const overlays = []
  for (const hit of hits) {
    const rect = toRect(hit.box, W, H)
    if (!rect) continue
    const region = { left: rect.x, top: rect.y, width: rect.w, height: rect.h }
    const sigma = Math.min(BLUR, Math.max(6, Math.floor(Math.min(rect.w, rect.h) / 2) - 1))
    let blurred
    try {
      blurred = await sharp(master).extract(region).blur(sigma).toBuffer()
    } catch {
      const tiny = Math.max(2, Math.round(rect.w / 14))
      blurred = await sharp(master)
        .extract(region)
        .resize({ width: tiny })
        .resize({ width: rect.w, height: rect.h, kernel: 'nearest' })
        .toBuffer()
    }
    overlays.push({ input: blurred, left: rect.x, top: rect.y })
  }
  if (!overlays.length) return master
  return sharp(master).composite(overlays).webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false }).toBuffer()
}

async function findInbox(label) {
  const want = label.normalize('NFKC')
  const names = await fs.readdir(path.join(ROOT, 'inbox'))
  const hit = names.find((n) => n.normalize('NFKC') === want)
  if (!hit) throw new Error(`inbox missing: ${label}`)
  return path.join(ROOT, 'inbox', hit)
}

async function listImages(dir) {
  const names = await fs.readdir(dir)
  const files = []
  for (const name of names) {
    if (!/\.(png|jpe?g|heic|webp)$/i.test(name)) continue
    const full = path.join(dir, name)
    const stat = await fs.stat(full)
    files.push({ full, created: stat.birthtimeMs || stat.mtimeMs })
  }
  files.sort((a, b) => a.created - b.created || a.full.localeCompare(b.full))
  return files.map((file) => file.full)
}

async function lookup(trackId) {
  const res = await fetch(`https://itunes.apple.com/lookup?id=${trackId}&country=jp&lang=ja_jp`)
  const data = await res.json()
  const app = data.results?.[0]
  if (!app) throw new Error(`lookup failed for ${trackId}`)
  return app
}

async function ensureCrowdworks(apps) {
  if (apps.some((a) => a.name === 'クラウドワークス' || a.slug === 'crowdworks')) {
    console.log('skip create クラウドワークス (exists)')
    return
  }
  const store = await lookup(1013797155)
  const dir = path.join(ROOT, 'public/appui-images/crowdworks')
  await fs.mkdir(dir, { recursive: true })
  const art = await (await fetch(store.artworkUrl512)).arrayBuffer()
  const icon = await toMasterWebp(Buffer.from(art))
  await fs.writeFile(path.join(dir, 'icon.webp'), icon)
  await fs.writeFile(path.join(dir, 'icon.list.webp'), await toDisplayWebp(icon, LIST))
  await fs.writeFile(path.join(dir, 'icon.detail.webp'), await toDisplayWebp(icon, DETAIL))
  const genre = GENRE_TO_CATEGORY[store.primaryGenreName] || store.primaryGenreName || '仕事効率化'
  apps.push({
    id: `crowdworks-${Date.now()}-${uid(4)}`,
    name: 'クラウドワークス',
    description: truncate(store.description),
    iconUrl: '/appui-images/crowdworks/icon.webp',
    externalUrl: store.trackViewUrl,
    categories: [genre],
    components: [
      'オンボーディング',
      'ボタン',
      'ヘッダー',
      'フォーム',
      'リスト',
      'カード',
      '検索',
      'フィルター',
      'タブ・セグメントコントロール',
      'ボトム ナビゲーション',
      'メッセージ',
      'プロフィール',
    ],
    sections: [],
    slug: 'crowdworks',
  })
  console.log(`created クラウドワークス ← ${store.trackName}`)
}

const BATCH = [
  {
    appId: 'campus-1794033030755-by3t',
    inbox: 'キャンパス',
    folder: 'campus',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター', 'プロフィール'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /次へ/, /ログイン/, /新規/]],
      ['ホーム', [/ホーム/, /タイムライン/, /おすすめ/, /お知らせ/]],
      ['検索・一覧', [/検索/, /企業/, /求人/, /インターン/, /スカウト/]],
      ['詳細', [/企業情報/, /募集/, /詳細/, /会社概要/]],
      ['メッセージ', [/メッセージ/, /チャット/, /トーク/]],
      ['プロフィール', [/プロフィール/, /経歴/, /学歴/, /自己PR/, /企業名/, /在籍/]],
      ['設定', [/設定/, /アカウント/, /通知/, /ヘルプ/]],
    ],
  },
  {
    appId: 'kyujin-box-1794033031436-6ji1',
    inbox: '求人ボックス',
    folder: 'kyujin-box',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/]],
      ['求人検索', [/検索/, /条件/, /エリア/, /職種/, /こだわり/]],
      ['求人一覧', [/件/, /求人/, /リスト/, /並び替え/]],
      ['求人詳細', [/詳細/, /応募/, /給与/, /勤務地/, /会社/]],
      ['保存・履歴', [/保存/, /気になる/, /履歴/, /閲覧/]],
      ['マイページ・設定', [/マイページ/, /設定/, /プロフィール/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'standby-1794033032183-3g2e',
    inbox: 'スタンバイ',
    folder: 'standby',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/]],
      ['求人検索', [/検索/, /条件/, /エリア/, /職種/, /こだわり/]],
      ['求人一覧', [/件/, /求人/, /リスト/, /並び替え/]],
      ['求人詳細', [/詳細/, /応募/, /給与/, /勤務地/, /会社/]],
      ['保存・履歴', [/保存/, /気になる/, /履歴/, /閲覧/]],
      ['マイページ・設定', [/マイページ/, /設定/, /プロフィール/, /通知/, /アカウント/]],
    ],
  },
  {
    appId: 'satofuru-1794033032669-11tz',
    inbox: 'さとふる',
    folder: 'satofuru',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /特集/, /人気/]],
      ['検索・一覧', [/検索/, /返礼品/, /カテゴリ/, /ランキング/]],
      ['返礼品詳細', [/詳細/, /寄付/, /返礼/, /自治体/]],
      ['カート・寄付', [/カート/, /寄付する/, /決済/, /申し込み/]],
      ['マイページ', [/マイページ/, /寄付履歴/, /お気に入り/, /控除/, /会員/]],
      ['設定', [/設定/, /アカウント/, /通知/, /ヘルプ/, /住所/, /登録情報/]],
    ],
  },
  {
    appId: null,
    matchName: 'クラウドワークス',
    inbox: 'クラウドワークス',
    folder: 'crowdworks',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'メッセージ', 'プロフィール'],
    rules: [
      ['オンボーディング', [/ようこそ/, /はじめる/, /始める/, /ログイン/, /新規登録/, /次へ/]],
      ['ホーム', [/ホーム/, /おすすめ/, /新着/, /仕事を探す/]],
      ['検索・一覧', [/検索/, /カテゴリ/, /募集/, /仕事/]],
      ['仕事詳細', [/詳細/, /応募/, /報酬/, /納期/, /依頼/, /固定報酬/]],
      ['メッセージ', [/メッセージ/, /トーク/, /相談/, /受信/]],
      ['マイページ', [/マイページ/, /プロフィール/, /本人確認/, /アカウント/, /報酬/]],
      ['設定', [/設定/, /通知/, /ヘルプ/]],
    ],
  },
]

const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
await ensureCrowdworks(apps)
const crowd = apps.find((a) => a.name === 'クラウドワークス')
if (crowd) BATCH[4].appId = crowd.id

const report = []

const only = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))

for (const spec of BATCH) {
  if (only.length && !only.some((name) => name === spec.folder || name === spec.inbox)) continue
  const inboxDir = await findInbox(spec.inbox)
  const destDir = path.join(ROOT, 'public/appui-images', spec.folder)
  await fs.mkdir(destDir, { recursive: true })
  const files = await listImages(inboxDir)
  const grouped = new Map()
  const order = []
  const blurred = []

  console.log(`\n== ${spec.inbox} (${files.length}) ==`)
  let i = 0
  for (const src of files) {
    i += 1
    const stem = safeStem(path.basename(src, path.extname(src)))
    process.stdout.write(`\r  ${i}/${files.length} ${stem}   `)
    let master = await toMasterWebp(await fs.readFile(src))
    const boxes = await ocrBuffer(master)
    const text = boxes.map((b) => String(b.text || '')).join('\n')
    const hits = collectHits(boxes)
    if (hits.length) {
      master = await blurMaster(master, hits)
      blurred.push({
        file: `${spec.folder}/${stem}.webp`,
        hits: hits.map((h) => ({ kind: h.kind, text: h.text.slice(0, 80) })),
      })
    }
    await fs.writeFile(path.join(destDir, `${stem}.webp`), master)
    await fs.writeFile(path.join(destDir, `${stem}.list.webp`), await toDisplayWebp(master, LIST))
    await fs.writeFile(path.join(destDir, `${stem}.detail.webp`), await toDisplayWebp(master, DETAIL))

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
  const storeSections = (app.sections || []).filter((section) => section.title === 'ストア画像')
  app.sections = [...storeSections, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]
  const summary = Object.fromEntries([...grouped.entries()].map(([k, v]) => [k, v.length]))
  report.push({ name: app.name, converted: files.length, sections: summary, blurred: blurred.length, blurredFiles: blurred })
  console.log(app.name, summary, `blurred=${blurred.length}`)
  await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
}

console.log('\nDONE_IMPORT')
console.log(JSON.stringify(report, null, 2))
