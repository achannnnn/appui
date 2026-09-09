import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const APPS_JSON = path.join(ROOT, 'public/apps.json')
const LIST = 600
const DETAIL = 1200
const Q = 90

function uid(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[(Math.random() * chars.length) | 0]
  return s
}

function truncate(text, max = 120) {
  const n = String(text || '').replace(/\s+/g, ' ').trim()
  if (n.length <= max) return n
  return `${n.slice(0, max).trim()}…`
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
  const buf = await fs.readFile(srcPath)
  const master = await toMasterWebp(buf)
  const masterPath = path.join(destDir, `${stem}.webp`)
  await fs.writeFile(masterPath, master)
  await fs.writeFile(path.join(destDir, `${stem}.list.webp`), await toDisplayWebp(master, LIST))
  await fs.writeFile(path.join(destDir, `${stem}.detail.webp`), await toDisplayWebp(master, DETAIL))
  return `/appui-images/${path.basename(destDir)}/${stem}.webp`
}

function mkImage(src, components) {
  const filename = `${path.basename(src)}`
  return {
    id: uid(),
    src,
    filename,
    components,
  }
}

function section(title, files, folder, components) {
  return {
    id: uid(),
    title,
    images: files.map((stem) => mkImage(`${folder}/${stem}.webp`, components)),
  }
}

const DEFAULT = ['カード', 'リスト', 'ヘッダー', 'ボタン']

const BATCH = [
  {
    appId: 'urban-research-1788097702878-j1na',
    inbox: 'inbox/アーバンリサーチ',
    folder: 'urban-research',
    components: [...DEFAULT, '検索', 'フィルター'],
    sections: [
      { title: 'ホーム', files: ['IMG_2452', 'IMG_2453', 'IMG_2454', 'IMG_2455', 'IMG_2456', 'IMG_2457', 'IMG_2459', 'IMG_2460', 'IMG_2461'] },
      { title: '探す', files: ['IMG_2458', 'IMG_2462', 'IMG_2463', 'IMG_2464', 'IMG_2465', 'IMG_2466', 'IMG_2467', 'IMG_2468', 'IMG_2469', 'IMG_2470', 'IMG_2471', 'IMG_2472'] },
      { title: '商品詳細', files: ['IMG_2473', 'IMG_2474', 'IMG_2475', 'IMG_2476', 'IMG_2477', 'IMG_2478', 'IMG_2479', 'IMG_2480', 'IMG_2481', 'IMG_2482', 'IMG_2483', 'IMG_2484', 'IMG_2485', 'IMG_2486'] },
      { title: 'スタイリング', files: ['IMG_2488', 'IMG_2489'] },
      { title: '会員証', files: ['IMG_2490', 'IMG_2491', 'IMG_2493', 'IMG_2494'] },
      { title: '注文・カート', files: ['IMG_2495', 'IMG_2496', 'IMG_2497'] },
    ],
  },
  {
    appId: 'hotpepper-1788097727766-yoyl',
    inbox: 'inbox/ホットペッパー',
    folder: 'hotpepper',
    components: [...DEFAULT, '検索', 'フィルター', '地図'],
    sections: [
      { title: 'ホーム', files: ['IMG_2501', 'IMG_2502', 'IMG_2503', 'IMG_2504'] },
      { title: '検索', files: ['IMG_2505', 'IMG_2506', 'IMG_2507', 'IMG_2508', 'IMG_2509', 'IMG_2510', 'IMG_2511', 'IMG_2512', 'IMG_2513', 'IMG_2514', 'IMG_2515', 'IMG_2516', 'IMG_2517', 'IMG_2518', 'IMG_2519'] },
      { title: 'サロン', files: ['IMG_2520', 'IMG_2521', 'IMG_2522', 'IMG_2523', 'IMG_2524', 'IMG_2525', 'IMG_2526', 'IMG_2527', 'IMG_2531'] },
      { title: '予約', files: ['IMG_2528', 'IMG_2529', 'IMG_2530'] },
      { title: 'スタイル', files: ['IMG_2532', 'IMG_2533', 'IMG_2534', 'IMG_2535', 'IMG_2543', 'IMG_2544', 'IMG_2545', 'IMG_2546', 'IMG_2547', 'IMG_2548', 'IMG_2549', 'IMG_2550', 'IMG_2551', 'IMG_2552', 'IMG_2553'] },
      { title: 'マイページ', files: ['IMG_2536', 'IMG_2537', 'IMG_2538', 'IMG_2539', 'IMG_2540', 'IMG_2541', 'IMG_2542'] },
      { title: 'ブログ・口コミ', files: ['IMG_2554', 'IMG_2555', 'IMG_2556', 'IMG_2557', 'IMG_2558', 'IMG_2559', 'IMG_2560', 'IMG_2561', 'IMG_2562'] },
    ],
  },
  {
    appId: 'mister-donut-1788097743638-oecv',
    inbox: 'inbox/ミスタードーナッツ',
    folder: 'mister-donut',
    components: [...DEFAULT, 'ボトム ナビゲーション', 'オンボーディング'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_2392', 'IMG_2393', 'IMG_2394', 'IMG_2395', 'IMG_2396', 'IMG_2397', 'IMG_2398'] },
      { title: '会員登録', files: ['IMG_2399', 'IMG_2400', 'IMG_2401'] },
      { title: 'ホーム', files: ['IMG_2402', 'IMG_2403', 'IMG_2404', 'IMG_2405', 'IMG_2406'] },
      { title: 'メニュー', files: ['IMG_2410', 'IMG_2411', 'IMG_2412', 'IMG_2413', 'IMG_2414', 'IMG_2415', 'IMG_2416', 'IMG_2417', 'IMG_2418', 'IMG_2419', 'IMG_2420'] },
      { title: 'お知らせ', files: ['IMG_2421', 'IMG_2422', 'IMG_2423', 'IMG_2424'] },
      { title: '店舗・オーダー', files: ['IMG_2425', 'IMG_2426', 'IMG_2427', 'IMG_2428', 'IMG_2429', 'IMG_2430', 'IMG_2431', 'IMG_2432', 'IMG_2433', 'IMG_2434', 'IMG_2440', 'IMG_2441', 'IMG_2442', 'IMG_2443', 'IMG_2444', 'IMG_2445', 'IMG_2446', 'IMG_2447', 'IMG_2448', 'IMG_2449'] },
      { title: 'マイページ', files: ['IMG_2435', 'IMG_2436', 'IMG_2437', 'IMG_2438', 'IMG_2439'] },
    ],
  },
]

async function updateHotpepperBeauty(app) {
  const res = await fetch('https://itunes.apple.com/lookup?id=385724144&country=jp&lang=ja_jp')
  const data = await res.json()
  const meta = data.results?.[0]
  if (!meta) return app
  app.name = 'ホットペッパービューティー'
  app.description = truncate(meta.description)
  app.externalUrl = meta.trackViewUrl
  app.categories = ['ライフスタイル']
  app.components = ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター', '地図', 'タブ・セグメントコントロール', 'プロフィール']
  return app
}

const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
const report = []

for (const spec of BATCH) {
  const destDir = path.join(ROOT, 'public/appui-images', spec.folder)
  const inboxDir = path.join(ROOT, spec.inbox)
  let converted = 0
  for (const sec of spec.sections) {
    for (const stem of sec.files) {
      const src = path.join(inboxDir, `${stem}.PNG`)
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
  if (idx < 0) throw new Error(`app not found: ${spec.appId}`)
  const app = apps[idx]
  const store = app.sections.find((s) => s.title === 'ストア画像') || app.sections[0]
  const folderPrefix = `/appui-images/${spec.folder}`
  const deviceSections = spec.sections.map((s) =>
    section(s.title, s.files, folderPrefix, spec.components.slice(0, 5)),
  )
  app.sections = [store, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]
  if (spec.appId.startsWith('hotpepper')) await updateHotpepperBeauty(app)
  report.push({ name: app.name, converted, deviceSections: deviceSections.length })
  console.log(`${app.name}: converted ${converted} images, ${deviceSections.length} sections`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ report }, null, 2))
