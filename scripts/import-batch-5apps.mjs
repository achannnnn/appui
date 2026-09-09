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
  return { id: uid(), src, filename: `${path.basename(src)}`, components }
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
    appId: 'mcdonalds-1788097736197-qqdk',
    inbox: 'inbox/マクドナルド',
    folder: 'mcdonalds',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'ボトム ナビゲーション', '地図'],
    sections: [
      { title: 'ホーム', files: ['IMG_2575', 'IMG_2592'] },
      { title: 'メニュー', files: ['IMG_2576', 'IMG_2601', 'IMG_2602', 'IMG_2603', 'IMG_2604', 'IMG_2605', 'IMG_2606', 'IMG_2607', 'IMG_2608', 'IMG_2609', 'IMG_2610', 'IMG_2611'] },
      { title: '店舗検索', files: ['IMG_2577', 'IMG_2578', 'IMG_2579', 'IMG_2580', 'IMG_2581', 'IMG_2582'] },
      { title: 'デリバリー', files: ['IMG_2583', 'IMG_2584', 'IMG_2585', 'IMG_2586', 'IMG_2587', 'IMG_2588', 'IMG_2589', 'IMG_2590', 'IMG_2591'] },
      { title: 'リワード', files: ['IMG_2595', 'IMG_2596', 'IMG_2597', 'IMG_2598', 'IMG_2599', 'IMG_2600'] },
      { title: '注文', files: ['IMG_2612', 'IMG_2614', 'IMG_2615', 'IMG_2616', 'IMG_2617', 'IMG_2618', 'IMG_2619'] },
      { title: '設定', files: ['IMG_2620', 'IMG_2621', 'IMG_2622', 'IMG_2623', 'IMG_2624', 'IMG_2625', 'IMG_2626'] },
    ],
  },
  {
    appId: 'share-lounge-1788273669538-tuh2',
    inbox: 'inbox/SHARE LOUNGE',
    folder: 'share-lounge',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', '地図', 'フィルター'],
    sections: [
      { title: 'ホーム', files: ['IMG_2629', 'IMG_2637'] },
      { title: '店舗検索', files: ['IMG_2630', 'IMG_2631', 'IMG_2632', 'IMG_2633', 'IMG_2634', 'IMG_2635', 'IMG_2663'] },
      { title: '予約', files: ['IMG_2638', 'IMG_2639', 'IMG_2640', 'IMG_2641', 'IMG_2642', 'IMG_2643', 'IMG_2644', 'IMG_2645', 'IMG_2646', 'IMG_2647', 'IMG_2648', 'IMG_2649', 'IMG_2650', 'IMG_2651', 'IMG_2652', 'IMG_2653', 'IMG_2654', 'IMG_2678'] },
      { title: '予約確認', files: ['IMG_2655'] },
      { title: 'チケット', files: ['IMG_2657', 'IMG_2658', 'IMG_2659', 'IMG_2660', 'IMG_2661', 'IMG_2662'] },
      { title: 'お知らせ', files: ['IMG_2665', 'IMG_2666', 'IMG_2667'] },
      { title: 'マイページ', files: ['IMG_2668', 'IMG_2669', 'IMG_2670', 'IMG_2671', 'IMG_2672', 'IMG_2673', 'IMG_2674', 'IMG_2675', 'IMG_2676', 'IMG_2677', 'IMG_2679', 'IMG_2680', 'IMG_2681'] },
    ],
  },
  {
    appId: 'lowya-1788273678136-8qt6',
    inbox: 'inbox/LOWYA',
    folder: 'lowya',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [
      { title: 'ホーム', files: ['IMG_2684', 'IMG_2690', 'IMG_2691', 'IMG_2692', 'IMG_2712'] },
      { title: '会員登録', files: ['IMG_2685', 'IMG_2686', 'IMG_2687', 'IMG_2688', 'IMG_2689'] },
      { title: '商品詳細', files: ['IMG_2694', 'IMG_2695', 'IMG_2696', 'IMG_2697', 'IMG_2698', 'IMG_2699', 'IMG_2700', 'IMG_2701', 'IMG_2702', 'IMG_2703', 'IMG_2704', 'IMG_2705', 'IMG_2711'] },
      { title: '検索', files: ['IMG_2713', 'IMG_2714', 'IMG_2715', 'IMG_2716', 'IMG_2717'] },
      { title: 'カテゴリ', files: ['IMG_2718', 'IMG_2719', 'IMG_2720', 'IMG_2721', 'IMG_2722'] },
      { title: 'お気に入り・カート', files: ['IMG_2723', 'IMG_2724', 'IMG_2725'] },
      { title: 'マイページ', files: ['IMG_2726', 'IMG_2727', 'IMG_2728', 'IMG_2729', 'IMG_2730', 'IMG_2732', 'IMG_2733', 'IMG_2734', 'IMG_2735', 'IMG_2736', 'IMG_2737', 'IMG_2738'] },
    ],
  },
  {
    appId: 'nitori-1788273683828-hfe4',
    inbox: 'inbox/ニトリ',
    folder: 'nitori',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター', '地図'],
    sections: [
      { title: 'ホーム', files: ['IMG_2740', 'IMG_2741', 'IMG_2742', 'IMG_2749'] },
      { title: '商品詳細', files: ['IMG_2743', 'IMG_2744', 'IMG_2745', 'IMG_2746', 'IMG_2750', 'IMG_2751', 'IMG_2752', 'IMG_2753', 'IMG_2754'] },
      { title: '会員登録', files: ['IMG_2747', 'IMG_2748', 'IMG_2774', 'IMG_2775'] },
      { title: 'カテゴリ', files: ['IMG_2756', 'IMG_2757', 'IMG_2758', 'IMG_2759', 'IMG_2760', 'IMG_2761', 'IMG_2762', 'IMG_2763'] },
      { title: '比較', files: ['IMG_2764', 'IMG_2765', 'IMG_2766'] },
      { title: 'お知らせ', files: ['IMG_2755'] },
      { title: '在庫・店舗', files: ['IMG_2767', 'IMG_2768', 'IMG_2769', 'IMG_2770', 'IMG_2771', 'IMG_2772', 'IMG_2773'] },
    ],
  },
  {
    appId: 'yamazaki-1788273692519-pg2g',
    inbox: 'inbox/山﨑実業',
    folder: 'yamazaki',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [
      { title: 'ホーム', files: ['IMG_2777', 'IMG_2778', 'IMG_2779', 'IMG_2780', 'IMG_2781', 'IMG_2800', 'IMG_2801'] },
      { title: '検索', files: ['IMG_2782', 'IMG_2783', 'IMG_2804', 'IMG_2805', 'IMG_2806'] },
      { title: 'ログイン・会員', files: ['IMG_2784', 'IMG_2785', 'IMG_2786', 'IMG_2787', 'IMG_2788', 'IMG_2815', 'IMG_2816', 'IMG_2817', 'IMG_2818', 'IMG_2819', 'IMG_2820', 'IMG_2821', 'IMG_2822', 'IMG_2823', 'IMG_2824'] },
      { title: '商品詳細', files: ['IMG_2789', 'IMG_2790', 'IMG_2791', 'IMG_2792', 'IMG_2793', 'IMG_2794', 'IMG_2802', 'IMG_2803'] },
      { title: 'カート・決済', files: ['IMG_2795', 'IMG_2796', 'IMG_2797', 'IMG_2798', 'IMG_2799'] },
      { title: 'スタンプ', files: ['IMG_2807', 'IMG_2808', 'IMG_2809', 'IMG_2810', 'IMG_2811', 'IMG_2812', 'IMG_2813', 'IMG_2814'] },
      { title: 'お気に入り', files: ['IMG_2825'] },
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
      const src = path.join(inboxDir, `${stem}.PNG`)
      try {
        await fs.access(src)
        await convertPng(src, destDir, stem)
        converted++
      } catch {
        console.warn('skip', src)
      }
    }
  }
  const idx = apps.findIndex((a) => a.id === spec.appId)
  if (idx < 0) throw new Error(`missing app ${spec.appId}`)
  const app = apps[idx]
  const store = app.sections.find((s) => s.title === 'ストア画像') || app.sections[0]
  const prefix = `/appui-images/${spec.folder}`
  const deviceSections = spec.sections.map((s) =>
    section(s.title, s.files, prefix, spec.components.slice(0, 5)),
  )
  app.sections = [store, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]
  report.push({ name: app.name, converted, sections: deviceSections.length })
  console.log(`${app.name}: ${converted} images, ${deviceSections.length} sections`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ report }, null, 2))
