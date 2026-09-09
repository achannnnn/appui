import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
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
    appId: 'nikki-1788675479392-cl2o',
    inbox: 'inbox/日記',
    folder: 'nikki',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー'],
    sections: [
      { title: 'ホーム', files: ['IMG_3386', 'IMG_3387', 'IMG_3388', 'IMG_3389'] },
      { title: 'カレンダー', files: ['IMG_3390', 'IMG_3400'] },
      { title: 'プレミアム', files: ['IMG_3385', 'IMG_3392'] },
      { title: '設定', files: ['IMG_3391', 'IMG_3393', 'IMG_3394', 'IMG_3395', 'IMG_3396', 'IMG_3397', 'IMG_3398', 'IMG_3399'] },
    ],
  },
  {
    appId: 'my-nicca-1788675487824-xzdb',
    inbox: 'inbox/my nicca',
    folder: 'my-nicca',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'カレンダー'],
    sections: [
      { title: 'ホーム', files: ['IMG_3402', 'IMG_3403', 'IMG_3407', 'IMG_3408', 'IMG_3409', 'IMG_3410', 'IMG_3413'] },
      { title: '習慣編集', files: ['IMG_3404', 'IMG_3405', 'IMG_3406', 'IMG_3412', 'IMG_3414', 'IMG_3415'] },
      { title: 'サマリー', files: ['IMG_3411'] },
      { title: '設定', files: ['IMG_3416', 'IMG_3417', 'IMG_3418', 'IMG_3419', 'IMG_3420'] },
    ],
  },
  {
    appId: 'hikidashi-nikki-1788675496283-qrr2',
    inbox: 'inbox/引き出し日記',
    folder: 'hikidashi-nikki',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [
      { title: 'ホーム・投稿', files: ['IMG_3422', 'IMG_3423', 'IMG_3424', 'IMG_3426', 'IMG_3427', 'IMG_3431', 'IMG_3432', 'IMG_3433', 'IMG_3434', 'IMG_3435', 'IMG_3436'] },
      { title: 'タグ', files: ['IMG_3428', 'IMG_3429', 'IMG_3430'] },
      { title: 'プレミアム', files: ['IMG_3438', 'IMG_3439', 'IMG_3440'] },
      { title: 'カレンダー', files: ['IMG_3441'] },
    ],
  },
  {
    appId: 'seeklog-1788675506545-9y49',
    inbox: 'inbox/シークログ',
    folder: 'seeklog',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_3443', 'IMG_3444'] },
      { title: 'タイムライン', files: ['IMG_3445', 'IMG_3446', 'IMG_3447'] },
      { title: 'タグ', files: ['IMG_3448', 'IMG_3449', 'IMG_3450', 'IMG_3469'] },
      { title: '検索', files: ['IMG_3451', 'IMG_3452', 'IMG_3453', 'IMG_3454', 'IMG_3455'] },
      { title: 'お気に入り', files: ['IMG_3456', 'IMG_3457', 'IMG_3458', 'IMG_3459'] },
      { title: 'カレンダー', files: ['IMG_3460'] },
      { title: '設定', files: ['IMG_3461', 'IMG_3462', 'IMG_3463', 'IMG_3464', 'IMG_3465', 'IMG_3466', 'IMG_3467', 'IMG_3468', 'IMG_3470', 'IMG_3471', 'IMG_3472', 'IMG_3473', 'IMG_3474', 'IMG_3475'] },
    ],
  },
  {
    appId: 'tokyo-bosai-1788675520926-hty4',
    inbox: 'inbox/東京都防災アプリ',
    folder: 'tokyo-bosai',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '地図'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_3241', 'IMG_3242', 'IMG_3243', 'IMG_3244', 'IMG_3245', 'IMG_3246'] },
      { title: 'ホーム・お知らせ', files: ['IMG_3247', 'IMG_3251', 'IMG_3252', 'IMG_3253', 'IMG_3275'] },
      { title: 'マイエリア', files: ['IMG_3248', 'IMG_3249', 'IMG_3250'] },
      { title: '緊急ブザー', files: ['IMG_3254', 'IMG_3255', 'IMG_3256', 'IMG_3257', 'IMG_3258', 'IMG_3259', 'IMG_3260', 'IMG_3318'] },
      { title: '防災マップ', files: ['IMG_3261', 'IMG_3262', 'IMG_3264', 'IMG_3265', 'IMG_3266', 'IMG_3267', 'IMG_3268', 'IMG_3269', 'IMG_3270', 'IMG_3271', 'IMG_3272', 'IMG_3273', 'IMG_3274'] },
      { title: 'マイページ', files: ['IMG_3276', 'IMG_3277', 'IMG_3278', 'IMG_3279', 'IMG_3280', 'IMG_3281', 'IMG_3282', 'IMG_3283', 'IMG_3284', 'IMG_3285', 'IMG_3286', 'IMG_3287', 'IMG_3288', 'IMG_3289', 'IMG_3290', 'IMG_3291', 'IMG_3302'] },
      { title: '防災シティ', files: ['IMG_3292', 'IMG_3293', 'IMG_3294', 'IMG_3295', 'IMG_3296', 'IMG_3297', 'IMG_3298', 'IMG_3299', 'IMG_3300', 'IMG_3301'] },
      { title: '東京防災・くらし防災', files: ['IMG_3303', 'IMG_3304', 'IMG_3305', 'IMG_3306', 'IMG_3307', 'IMG_3308', 'IMG_3309', 'IMG_3310', 'IMG_3311', 'IMG_3312'] },
      { title: '防災クイズ', files: ['IMG_3313', 'IMG_3314', 'IMG_3315', 'IMG_3316'] },
      { title: '設定・ヘルプ', files: ['IMG_3317', 'IMG_3319', 'IMG_3320', 'IMG_3321', 'IMG_3322', 'IMG_3323', 'IMG_3324', 'IMG_3325', 'IMG_3326'] },
    ],
  },
  {
    appId: 'nerv-bosai-1788675538500-lo77',
    inbox: 'inbox/NERV防災',
    folder: 'nerv-bosai',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '地図'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_3328', 'IMG_3329', 'IMG_3330', 'IMG_3331', 'IMG_3332', 'IMG_3333'] },
      { title: 'ホーム・タイムライン', files: ['IMG_3334', 'IMG_3335', 'IMG_3336', 'IMG_3337', 'IMG_3338', 'IMG_3339', 'IMG_3349'] },
      { title: 'メニュー・設定', files: ['IMG_3340', 'IMG_3341', 'IMG_3342', 'IMG_3343', 'IMG_3344', 'IMG_3345'] },
      { title: 'サポーターズ', files: ['IMG_3346', 'IMG_3347', 'IMG_3348'] },
      { title: 'マップ', files: ['IMG_3350', 'IMG_3351', 'IMG_3352', 'IMG_3353', 'IMG_3354', 'IMG_3355', 'IMG_3356'] },
      { title: '天気', files: ['IMG_3357', 'IMG_3358', 'IMG_3359'] },
    ],
  },
  {
    appId: 'daiso-1788675593312-ygdn',
    inbox: 'inbox/ダイソー',
    folder: 'daiso',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', '地図'],
    sections: [
      { title: 'ホーム', files: ['IMG_3361', 'IMG_3373', 'IMG_3376'] },
      { title: '検索・商品', files: ['IMG_3362', 'IMG_3363', 'IMG_3364', 'IMG_3365', 'IMG_3366', 'IMG_3367', 'IMG_3368', 'IMG_3369', 'IMG_3370', 'IMG_3371'] },
      { title: 'お知らせ', files: ['IMG_3372', 'IMG_3374', 'IMG_3378', 'IMG_3380', 'IMG_3381', 'IMG_3382'] },
      { title: 'メニュー', files: ['IMG_3375'] },
      { title: 'お買い物リスト', files: ['IMG_3377', 'IMG_3383'] },
      { title: '登録', files: ['IMG_3379'] },
    ],
  },
]

const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const report = []

for (const spec of BATCH) {
  const destDir = path.join(ROOT, 'public/appui-images', spec.folder)
  const inboxDir = path.join(ROOT, spec.inbox)
  let converted = 0

  for (const sec of spec.sections) {
    for (const stem of sec.files) {
      let src = path.join(inboxDir, `${stem}.PNG`)
      try {
        await fs.access(src)
      } catch {
        src = path.join(inboxDir, `${stem}.png`)
      }
      try {
        await fs.access(src)
        await convertPng(src, destDir, stem)
        converted++
      } catch {
        console.warn('skip missing', src)
      }
    }
  }

  const idx = apps.findIndex((a) => a.id === spec.appId)
  if (idx < 0) {
    console.warn(`app not found: ${spec.appId}`)
    continue
  }
  const app = apps[idx]
  const store = app.sections.find((s) => s.title === 'ストア画像') || app.sections[0]
  const folderPrefix = `/appui-images/${spec.folder}`
  const deviceSections = spec.sections.map((s) =>
    section(s.title, s.files, folderPrefix, spec.components.slice(0, 5)),
  )
  app.sections = [store, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]

  report.push({ name: app.name, converted, sections: deviceSections.length })
  console.log(`${app.name}: ${converted} images, ${deviceSections.length} sections`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ report }, null, 2))
