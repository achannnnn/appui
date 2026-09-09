import { promises as fs } from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import os from 'os'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SWIFT_SRC = path.join(__dirname, 'ocr-text.swift')
const OCR_BIN = path.join(__dirname, 'ocr-text')

const LIST_MAX_WIDTH = 600
const DETAIL_MAX_WIDTH = 1200
const DISPLAY_WEBP_QUALITY = 90
const PAD_X = 0.012
const PAD_Y = 0.008

const EMAIL_STRICT_RE = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i
const FULLWIDTH_EMAIL_RE =
  /[A-Za-z0-9._%+\-]+[\uFF20@][A-Za-z0-9.\-]+\.[A-Za-z]{2,}/
const PHONE_RE =
  /(?:\+81[- ]?)?(?:0[7-9]0-?\d{4}-?\d{4}|0\d{1,4}-\d{2,4}-\d{4})/
const NAME_RE = /\bERIKA\b/i
// Mixed alnum IDs starting with a digit (e.g. 9a1dpJNXcoWCAb). Avoid years / units.
const ACCOUNT_ID_RE =
  /\b(?=[A-Za-z0-9]*[A-Z])(?=[A-Za-z0-9]*[a-z])(?![12]\d{3}[A-Za-z])\d(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{11,17}\b/
const EXTRA_LITERALS = [
  '9a1dpJNXcoWCAb',
  '9aldpJNXcoWCAb',
  '9aldpJNXcOWCAb',
  '110-0001',
  '1100001',
  '台東区谷中',
  '佐藤タカシ',
  'さとうたかし',
  'サトウタカシ',
  '1995年7月28日',
  '平成7年7月28日',
  '東京都港反',
  '天野健司',
  '健司天野',
  '健司',
  'amanokenji83',
  '台東2丁目31-8',
  'コスモス食品',
  '兵庫県伊丹市鈴原町',
  'ベルフィールド',
  '631502010730',
  'kanaeryou55',
  '佐藤たかし',
  'サトウ タカシ',
  'サトウタカシ',
  '佐藤太郎',
  'サトウタロウ',
  '15314363',
]

const COMPANY_RE =
  /(?:株式会社|有限会社|合同会社|合資会社)[^\s]{0,40}|[^\s]{1,40}(?:株式会社|有限会社|合同会社|合資会社)|（株）[^\s]{0,30}|[^\s]{1,30}ホールディングス|[^\s]{1,24}グループ/

const JP_ADDRESS_RE =
  /(?:北海道|(?:東京|大阪|京都)都|[^\s\d]{2,3}[都道府県])[^\n]{0,48}(?:市|区|町|村)[^\n]{0,48}(?:丁目|番|号)/
const POSTAL_RE = /〒\s*\d{3}[-−]?\d{4}|\b\d{3}[-−]\d{4}\b/

let extraLiterals = []
let detectCompany = false
let detectIdCard = false
let detectAddress = false
let detectStore = false
let detectBizCard = false
let detectPersonName = false
let useBlur = false
const PAD_X_BLUR = 0.022
const PAD_Y_BLUR = 0.016
const BLUR_SIGMA = 22

function isStoreUiChrome(raw) {
  return /店舗限定|ご利用店舗|店舗を|店舗に|店舗の|店舗検索|近くの店舗|店舗一覧|店舗情報|店舗を選|選び直す|表示するブランド|この条件で検索|開店|閉店時間|営業時間/.test(
    raw,
  )
}

function isLikelyStoreName(raw) {
  if (!detectStore) return false
  const t = String(raw || '').trim()
  if (!t || isStoreUiChrome(t)) return false
  if (/コメダ珈琲店(オリジナル|でしか|＊|×|x|と|の)/i.test(t)) return false
  if (/^コメダ珈琲店$/.test(t)) return false
  if (/^おかげ庵$/.test(t)) return false
  if (/モバイルオーダー|プラントベース|季節限定|コラボ/.test(t)) return false
  if (/[珈琲]|コンジ|コッジ|コンダ|コァ|ヨカ|独店|建店|鶏|担真|の琲|カ琲/.test(t)) return false
  if (/コメダ珈琲店\s*[^\s]{2,24}店/.test(t)) return true
  if (
    /^[ぁ-んァ-ン一-龥A-Za-z0-9]{2,24}店$/.test(t) &&
    /(伊丹|昆陽|山田|イオン|モール|駅|市|町)/.test(t) &&
    !/^(店舗|設定|選択)/.test(t)
  ) {
    return true
  }
  return false
}

function isLikelyAddress(raw) {
  if (!detectAddress) return false
  const t = String(raw || '').trim()
  if (!t) return false
  if (POSTAL_RE.test(t)) return true
  if (JP_ADDRESS_RE.test(t)) return true
  if (/(?:市|区|町|村).{0,40}(?:丁目|番地)/.test(t) && /[0-9０-９]/.test(t)) return true
  return false
}

function isUiChromeLabel(raw) {
  const t = String(raw || '').trim()
  if (!t) return true
  if (/^\d{1,2}:\d{2}$/.test(t)) return true
  if (/^\d{1,3}%?$/.test(t)) return true
  if (/^\d+分前$/.test(t)) return true
  return /^(ホーム|設定|検索|次へ|戻る|ログイン|新規|登録|スキップ|キャンセル|保存|編集|削除|共有|フォロー|投稿|メニュー|お知らせ|メッセージ|イベント|マイページ|名刺|両面撮影|オンライン名刺交換|新規会員登録|名刺交換|連絡先|自分|未設定|基本情報|デジタル名刺|プロフィール|回答する|さっそく入力する|年齢：未入力|転職を検討している|転職を考えていない|利用します。|名刺撮影|スキャン|閉じる|続ける|完了|送信|確認|同意|詳細|一覧|もっと見る|おすすめ|新着|無料|有料)$/.test(
    t,
  )
}

function isPersonLikeName(raw) {
  if (!detectPersonName && !detectBizCard) return false
  const t = String(raw || '').trim()
  if (!t || isUiChromeLabel(t)) return false
  if (/本社|工場|営業|企画|本部|部|課|グループ|大学|学校|会社|店舗|オフィス/.test(t)) return false
  if (/さん$/.test(t) && t.length <= 24) return true
  // Space-separated Japanese names only (avoid 「ホテル・旅行」 industry labels)
  if (/^[一-龥ぁ-んァ-ン]{1,4}[\s　][一-龥ぁ-んァ-ン]{1,4}$/.test(t) && t.length >= 3 && t.length <= 14) {
    if (/株式会社|有限会社|ホールディング|グループ|大学|学校|業界|研究|専攻|学科/.test(t)) return false
    return true
  }
  return false
}

function isLikelyEmployerOrSchool(raw) {
  if (!detectCompany) return false
  const t = String(raw || '').trim()
  if (!t || isUiChromeLabel(t)) return false
  if (/マイナビ|エントリー|お気に入り|スカウト|説明会|インターン|選考|企業研究|求人/.test(t)) return false
  if (/(大学|短期大学|専門学校|高等学校|高専)$/.test(t) && t.length >= 4 && t.length <= 28 && !/^(専門学校|高等専門学校|高等学校)$/.test(t)) return true
  if (/グループ$/.test(t) && t.length >= 4 && t.length <= 28 && !/企業＆グループ|グループ企業|販売促進|本部|企画|マーケ/.test(t)) return true
  if (
    /^(JT|JTB|JAL|ANA|IBM|NTT|KDDI|SoftBank|SOFTBANK|SUNTORY|TOYOTA|HONDA|SONY|Panasonic|NEC|Fujitsu|FUJITSU|ORACLE|Amazon|Google|Microsoft|Meta|Apple|LOTTE|NITORI|AJINOMOTO|TBS)$/i.test(
      t,
    )
  ) {
    return true
  }
  if (
    /^(味の素|キリン|アサヒ|サントリー|日本生命|第一生命|三井住友|三菱UFJ|みずほ|楽天|サイバーエージェント|リクルート|電通|博報堂|住友商事|三菱商事|伊藤忠|丸紅|双日|豊田通商|NewMA|ニトリ|明治|ロッテ|良品計画|全日本空輸)/.test(
      t,
    )
  ) {
    return true
  }
  return false
}

function isBizCardCaptureScreen(boxes) {
  if (!detectBizCard) return false
  const joined = boxes.map((b) => String(b.text || '')).join('\n')
  const hasCardCue = /両面撮影|名刺を撮影|スキャン|デジタル名刺|名刺画像|名刺交換|連絡先/.test(joined)
  const hasIdentity = /TEL|FAX|MOBILE|株式会社|（株）|@/.test(joined)
  // Profile/card screens often expose full identity without "撮影" chrome
  const hasPersonAndCompany =
    /[一-龥]{1,4}[\s　]?[一-龥]{1,4}/.test(joined) && /株式会社|（株）/.test(joined) && /TEL|FAX|MOBILE|@/.test(joined)
  return (hasCardCue && hasIdentity) || hasPersonAndCompany
}

function bizCardCoverRect(boxes, width, height) {
  if (!isBizCardCaptureScreen(boxes)) return null
  const identity = boxes.filter((box) => {
    const t = String(box.text || '')
    return /TEL|FAX|株式会社|（株）|@|[一-龥]{2,}[\s　]?[一-龥]{1,4}/.test(t) && !isUiChromeLabel(t)
  })
  if (identity.length < 2) {
    const x = Math.round(width * 0.06)
    const y = Math.round(height * 0.18)
    const w = Math.round(width * 0.88)
    const h = Math.round(height * 0.42)
    return { kind: 'biz-card', text: '[card-region]', x, y, w, h }
  }
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  for (const box of identity) {
    minX = Math.min(minX, box.x)
    minY = Math.min(minY, 1 - box.y - box.h)
    maxX = Math.max(maxX, box.x + box.w)
    maxY = Math.max(maxY, 1 - box.y)
  }
  const pad = 0.04
  const x = Math.max(0, Math.round((minX - pad) * width))
  const y = Math.max(0, Math.round((minY - pad) * height))
  const w = Math.min(width - x, Math.round((maxX - minX + pad * 2) * width))
  const h = Math.min(height - y, Math.round((maxY - minY + pad * 2) * height))
  if (w < 40 || h < 40) return null
  return { kind: 'biz-card', text: '[card-region]', x, y, w, h }
}

function isPlaceholder(raw, normalized) {
  if (/example\.com/i.test(normalized)) return true
  if (/exampe\.com/i.test(normalized)) return true
  if (/XXXX@/i.test(normalized)) return true
  if (/0\d{0,4}-?X{2,}/i.test(normalized)) return true
  if (/XXXX/i.test(normalized)) return true
  if (/080[- ]?1234[- ]?5678/.test(normalized)) return true
  if (/03[- ]?1234[- ]?5678/.test(normalized)) return true
  if (/090[- ]?0000[- ]?0000/.test(normalized)) return true
  if (/090[- ]?1234[- ]?5678/.test(normalized)) return true
  if (/09012345678/.test(normalized)) return true
  if (/090[- ]?6666/.test(normalized)) return true
  if (/abc@example\.com/i.test(normalized)) return true
  if (/mail@example\.com/i.test(normalized)) return true
  if (/sample@sample\.com/i.test(normalized)) return true
  if (/sample@[a-z0-9.-]+\.[a-z]{2,}/i.test(normalized)) return true
  if (/^x{2,}@/i.test(normalized)) return true
  if (/@id\.lawson\.jp/i.test(normalized)) return true
  if (/mail@[a-z0-9.-]+\.[a-z]{2,}/i.test(normalized) && !/@gmail\.com/i.test(normalized)) return true
  if (/1230000/.test(normalized) && /郵便/.test(raw)) return true
  if (/^例[：:）)\s]/.test(raw.trim())) return true
  return false
}

function isLikelyAccountId(candidate) {
  if (!candidate) return false
  if (/mL|cm|mm|kg|px|App/i.test(candidate)) return false
  if (/^(19|20)\d{2}/.test(candidate)) return false
  // Require both letters and at least 2 digits; reject time+word mashups.
  const digits = (candidate.match(/\d/g) || []).length
  const letters = (candidate.match(/[A-Za-z]/g) || []).length
  if (digits < 2 || letters < 4) return false
  return true
}

function isLikelyPhone(normalized) {
  const match = normalized.match(PHONE_RE)
  if (!match) return false
  const digits = match[0].replace(/\D/g, '')
  // JP numbers are typically 10–11 digits; reject 00… order/intl-looking IDs.
  if (digits.length < 10 || digits.length > 11) return false
  if (/^00/.test(digits)) return false
  return true
}

function isPiiText(text) {
  const raw = String(text || '')
  const normalized = raw.replace(/\uFF20/g, '@').replace(/\s+/g, '')
  if (isPlaceholder(raw, normalized)) return null
  if (EMAIL_STRICT_RE.test(normalized) || FULLWIDTH_EMAIL_RE.test(raw)) return 'email'
  if (isLikelyPhone(normalized)) return 'phone'
  if (NAME_RE.test(raw) || NAME_RE.test(normalized)) return 'name'
  const literals = EXTRA_LITERALS.concat(extraLiterals)
  if (literals.some((value) => value && raw.toLowerCase().includes(value.toLowerCase()))) return 'id'
  // Only match on raw text — space-stripped strings create false IDs like "50AsiarTokyo".
  const acctRaw = raw.match(ACCOUNT_ID_RE)?.[0]
  if (isLikelyAccountId(acctRaw)) return 'id'
  if (isLikelyAddress(raw)) return 'address'
  if (isLikelyStoreName(raw)) return 'store'
  if (isPersonLikeName(raw)) return 'name'
  if (isLikelyEmployerOrSchool(raw)) return 'company'
  if (
    (detectCompany || detectBizCard) &&
    !/会社概要|株式会社マイナビ|^マイナビ$/.test(normalized) &&
    (COMPANY_RE.test(raw) || COMPANY_RE.test(normalized))
  ) {
    return 'company'
  }
  return null
}

function runCmd(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} failed (${code})`))
        return
      }
      resolve(stdout)
    })
  })
}

async function ensureOcrBin() {
  try {
    await fs.access(OCR_BIN)
    return
  } catch {
    // compile once
  }
  await runCmd('swiftc', ['-O', '-o', OCR_BIN, SWIFT_SRC])
}

async function runOcr(imagePath) {
  await ensureOcrBin()
  const tmp = path.join(os.tmpdir(), `appui-ocr-${process.pid}-${Date.now()}.png`)
  await sharp(imagePath, { animated: false })
    .rotate()
    .resize({ width: 1000, withoutEnlargement: true })
    .png()
    .toFile(tmp)
  try {
    const stdout = await runCmd(OCR_BIN, [tmp])
    return JSON.parse(stdout || '[]')
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }
}

function boxesToRects(boxes, width, height) {
  const padX = useBlur ? PAD_X_BLUR : PAD_X
  const padY = useBlur ? PAD_Y_BLUR : PAD_Y
  const rects = []
  const cover = bizCardCoverRect(boxes, width, height)
  if (cover) rects.push(cover)
  for (const box of boxes) {
    const kind = isPiiText(box.text)
    if (!kind) continue
    const x = Math.max(0, Math.round((box.x - padX) * width))
    const y = Math.max(0, Math.round((1 - box.y - box.h - padY) * height))
    const w = Math.min(width - x, Math.round((box.w + padX * 2) * width))
    const h = Math.min(height - y, Math.round((box.h + padY * 2) * height))
    if (w < 4 || h < 4) continue
    rects.push({ kind, text: box.text, x, y, w, h })
  }
  return rects
}

function isLicenseScreen(boxes) {
  return boxes.some((box) =>
    /まで有効|免許の眼鏡|平成\d+年.*生|第\s*\d{10,}/.test(String(box.text || '')),
  )
}

function licenseCoverRect(boxes, width, height) {
  if (!detectIdCard || !isLicenseScreen(boxes)) return null
  const inCard = boxes.filter((box) => {
    const yTop = 1 - box.y - box.h
    return yTop >= 0.16 && yTop <= 0.55
  })
  if (inCard.length < 4) return null
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  for (const box of inCard) {
    const yTop = 1 - box.y - box.h
    minX = Math.min(minX, box.x)
    minY = Math.min(minY, yTop)
    maxX = Math.max(maxX, box.x + box.w)
    maxY = Math.max(maxY, yTop + box.h)
  }
  minX = Math.max(0, minX - 0.08)
  maxX = Math.min(1, Math.max(maxX + 0.2, 0.94))
  minY = Math.max(0, minY - 0.045)
  maxY = Math.min(1, Math.max(maxY + 0.06, 0.68))
  const x = Math.max(0, Math.round(minX * width))
  const y = Math.max(0, Math.round(minY * height))
  const w = Math.min(width - x, Math.round((maxX - minX) * width))
  const h = Math.min(height - y, Math.round((maxY - minY) * height))
  if (w < 40 || h < 40) return null
  return { kind: 'id-card', text: '運転免許証', x, y, w, h }
}

async function toDisplayWebp(buffer, maxWidth) {
  return sharp(buffer, { animated: false })
    .rotate()
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .webp({
      quality: DISPLAY_WEBP_QUALITY,
      alphaQuality: DISPLAY_WEBP_QUALITY,
      effort: 4,
      smartSubsample: false,
    })
    .toBuffer()
}

function variantSiblingPath(filePath, variant) {
  const ext = path.extname(filePath)
  const base = filePath.slice(0, filePath.length - ext.length)
  return `${base}.${variant}${ext}`
}

async function listMasterImages(target) {
  const abs = path.resolve(ROOT, target)
  const stat = await fs.stat(abs)
  if (stat.isFile()) return [abs]
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
      if (/^screen-\d+/i.test(entry.name)) continue
      out.push(next)
    }
  }
  await walk(abs)
  return out.sort()
}

async function redactImage(filePath, { apply }) {
  const boxes = await runOcr(filePath)
  const meta = await sharp(filePath).metadata()
  const width = meta.width || 0
  const height = meta.height || 0
  const rects = boxesToRects(boxes, width, height)
  const cover = licenseCoverRect(boxes, width, height)
  if (cover) rects.unshift(cover)
  if (rects.length === 0) return { file: filePath, hits: [] }

  if (apply) {
    let image = sharp(filePath)
    if (useBlur) {
      const overlays = []
      for (const rect of rects) {
        const blurred = await sharp(filePath)
          .extract({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
          .blur(BLUR_SIGMA)
          .toBuffer()
        overlays.push({ input: blurred, left: rect.x, top: rect.y })
      }
      image = sharp(await image.composite(overlays).toBuffer())
    } else {
      const overlays = rects.map((rect) => ({
        input: {
          create: {
            width: rect.w,
            height: rect.h,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          },
        },
        left: rect.x,
        top: rect.y,
      }))
      image = sharp(await image.composite(overlays).toBuffer())
    }
    const master = await image
      .webp({ quality: 100, alphaQuality: 100, effort: 4, smartSubsample: false })
      .toBuffer()
    await fs.writeFile(filePath, master)
    if (filePath.endsWith('.webp')) {
      await fs.writeFile(variantSiblingPath(filePath, 'list'), await toDisplayWebp(master, LIST_MAX_WIDTH))
      await fs.writeFile(variantSiblingPath(filePath, 'detail'), await toDisplayWebp(master, DETAIL_MAX_WIDTH))
    }
  }

  return {
    file: path.relative(ROOT, filePath),
    hits: rects.map(({ kind, text }) => ({ kind, text })),
  }
}

const args = process.argv.slice(2)
const apply = args.includes('--apply')
detectCompany = args.includes('--company')
detectIdCard = args.includes('--id-card')
detectAddress = args.includes('--address')
detectStore = args.includes('--store')
detectBizCard = args.includes('--biz-card')
detectPersonName = args.includes('--person')
useBlur = args.includes('--blur')
extraLiterals = []
const targets = []
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i]
  if (
    arg === '--apply' ||
    arg === '--company' ||
    arg === '--id-card' ||
    arg === '--address' ||
    arg === '--store' ||
    arg === '--biz-card' ||
    arg === '--person' ||
    arg === '--blur'
  ) {
    continue
  }
  if (arg.startsWith('--literal=')) {
    extraLiterals.push(arg.slice('--literal='.length))
    continue
  }
  if (arg === '--literal') {
    extraLiterals.push(args[i + 1] || '')
    i += 1
    continue
  }
  targets.push(arg)
}
const scanTargets = targets.length > 0 ? targets : ['public/appui-images']

const files = []
for (const target of scanTargets) {
  files.push(...(await listMasterImages(target)))
}

console.log(`${apply ? 'redact' : 'scan'} ${files.length} images`)
const changed = []
let i = 0
for (const file of files) {
  i += 1
  try {
    const result = await redactImage(file, { apply })
    if (result.hits.length) {
      changed.push(result)
      console.log(`${i}/${files.length} HIT ${result.file} ${JSON.stringify(result.hits)}`)
    } else if (i % 25 === 0) {
      console.log(`${i}/${files.length}`)
    }
  } catch (error) {
    console.warn(`${i}/${files.length} skip ${path.relative(ROOT, file)}: ${error instanceof Error ? error.message : error}`)
  }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'scan', files: files.length, hits: changed.length, changed }, null, 2))
