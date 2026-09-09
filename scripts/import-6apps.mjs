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
    appId: 'dl-library-1788448605299-9cgd',
    inbox: 'inbox/DL Library',
    folder: 'dl-library',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [
      { title: 'ライブラリ', files: ['IMG_2994', 'IMG_2995', 'IMG_2996', 'IMG_2997', 'IMG_2998', 'IMG_2999'] },
      { title: '無料作品', files: ['IMG_3001', 'IMG_3002', 'IMG_3003', 'IMG_3005', 'IMG_3006'] },
      { title: '設定', files: ['IMG_3007', 'IMG_3008', 'IMG_3009', 'IMG_3010', 'IMG_3011', 'IMG_3012'] },
    ],
  },
  {
    appId: 'duolingo-1788448611308-ozvc',
    inbox: 'inbox/Duolingo',
    folder: 'duolingo',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'オンボーディング'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_2829', 'IMG_2830', 'IMG_2831', 'IMG_2832', 'IMG_2833', 'IMG_2834', 'IMG_2835', 'IMG_2836', 'IMG_2837', 'IMG_2838', 'IMG_2839', 'IMG_2840', 'IMG_2841', 'IMG_2842', 'IMG_2843'] },
      { title: 'レッスン', files: ['IMG_2844', 'IMG_2845', 'IMG_2846', 'IMG_2847', 'IMG_2848', 'IMG_2849', 'IMG_2850', 'IMG_2851', 'IMG_2852', 'IMG_2853', 'IMG_2854', 'IMG_2855', 'IMG_2881', 'IMG_2882', 'IMG_2883', 'IMG_2884', 'IMG_2885', 'IMG_2886', 'IMG_2887', 'IMG_2888', 'IMG_2889', 'IMG_2890', 'IMG_2891', 'IMG_2892', 'IMG_2893', 'IMG_2894', 'IMG_2895'] },
      { title: '連続記録・クエスト', files: ['IMG_2856', 'IMG_2857', 'IMG_2858', 'IMG_2859', 'IMG_2860', 'IMG_2861', 'IMG_2862', 'IMG_2863', 'IMG_2864', 'IMG_2865', 'IMG_2866', 'IMG_2867', 'IMG_2896', 'IMG_2897'] },
      { title: 'アカウント登録', files: ['IMG_2868', 'IMG_2869', 'IMG_2870', 'IMG_2873', 'IMG_2876', 'IMG_2877'] },
      { title: 'フレンズ・リーグ', files: ['IMG_2898', 'IMG_2899', 'IMG_2900', 'IMG_2901', 'IMG_2902', 'IMG_2903', 'IMG_2904', 'IMG_2905', 'IMG_2906', 'IMG_2907', 'IMG_2908', 'IMG_2909'] },
      { title: 'コース・プレミアム', files: ['IMG_2910', 'IMG_2911', 'IMG_2912', 'IMG_2913', 'IMG_2914', 'IMG_2915', 'IMG_2916', 'IMG_2917', 'IMG_2918', 'IMG_2919'] },
      { title: 'プロフィール', files: ['IMG_2920', 'IMG_2921', 'IMG_2922', 'IMG_2923', 'IMG_2924', 'IMG_2925', 'IMG_2926', 'IMG_2928'] },
    ],
  },
  {
    appId: 'webry-1788448620355-y1fe',
    inbox: 'inbox/うぇぶり',
    folder: 'webry',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', '検索', 'フィルター'],
    sections: [
      { title: 'ホーム', files: ['IMG_2931', 'IMG_2932', 'IMG_2933', 'IMG_2934', 'IMG_2938', 'IMG_2939', 'IMG_2940', 'IMG_2941', 'IMG_2942', 'IMG_2943', 'IMG_2944'] },
      { title: '会員登録', files: ['IMG_2935', 'IMG_2936', 'IMG_2937'] },
      { title: '作品詳細', files: ['IMG_2950', 'IMG_2951', 'IMG_2952', 'IMG_2953', 'IMG_2954', 'IMG_2955', 'IMG_2956', 'IMG_2957', 'IMG_2958', 'IMG_2959', 'IMG_2960', 'IMG_2961', 'IMG_2962', 'IMG_2963'] },
      { title: 'ミッション', files: ['IMG_2948', 'IMG_2949', 'IMG_2964', 'IMG_2965'] },
      { title: '無料マンガ・フェア', files: ['IMG_2966', 'IMG_2967', 'IMG_2968', 'IMG_2969'] },
      { title: '連載・ランキング', files: ['IMG_2970', 'IMG_2971', 'IMG_2972', 'IMG_2973', 'IMG_2975', 'IMG_2976'] },
      { title: 'お知らせ', files: ['IMG_2946', 'IMG_2947'] },
      { title: '単行本・雑誌', files: ['IMG_2977', 'IMG_2978', 'IMG_2979', 'IMG_2980', 'IMG_2981', 'IMG_2982'] },
      { title: '本棚・マイページ', files: ['IMG_2983', 'IMG_2984', 'IMG_2985', 'IMG_2990', 'IMG_2991', 'IMG_2992'] },
    ],
  },
  {
    appId: 'hobonichi-techo-1788448636207-vdzd',
    inbox: 'inbox/ほぼ日手帳',
    folder: 'hobonichi-techo',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'オンボーディング'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_3060', 'IMG_3062', 'IMG_3063', 'IMG_3064', 'IMG_3065', 'IMG_3066', 'IMG_3067', 'IMG_3068', 'IMG_3069', 'IMG_3070', 'IMG_3071', 'IMG_3072', 'IMG_3074', 'IMG_3075', 'IMG_3076', 'IMG_3077', 'IMG_3078', 'IMG_3079', 'IMG_3080', 'IMG_3081', 'IMG_3082', 'IMG_3084', 'IMG_3085', 'IMG_3086', 'IMG_3087'] },
      { title: '1日ページ', files: ['IMG_3088', 'IMG_3089', 'IMG_3090', 'IMG_3091', 'IMG_3092', 'IMG_3093', 'IMG_3094', 'IMG_3095', 'IMG_3096', 'IMG_3097', 'IMG_3098', 'IMG_3099', 'IMG_3100', 'IMG_3101', 'IMG_3102', 'IMG_3103', 'IMG_3104'] },
      { title: '月間ページ', files: ['IMG_3105', 'IMG_3106', 'IMG_3107', 'IMG_3108', 'IMG_3124', 'IMG_3125', 'IMG_3126', 'IMG_3127', 'IMG_3128'] },
      { title: 'コンテンツ追加', files: ['IMG_3109', 'IMG_3110', 'IMG_3111', 'IMG_3112', 'IMG_3113', 'IMG_3114', 'IMG_3115', 'IMG_3116', 'IMG_3129', 'IMG_3130', 'IMG_3131', 'IMG_3132', 'IMG_3133', 'IMG_3134', 'IMG_3135', 'IMG_3136', 'IMG_3137', 'IMG_3138', 'IMG_3139', 'IMG_3140', 'IMG_3141', 'IMG_3142'] },
      { title: 'タグ', files: ['IMG_3117', 'IMG_3118', 'IMG_3119', 'IMG_3120', 'IMG_3121', 'IMG_3122', 'IMG_3143', 'IMG_3144', 'IMG_3145', 'IMG_3146'] },
      { title: 'おまけ', files: ['IMG_3147', 'IMG_3148'] },
      { title: 'メニュー・設定', files: ['IMG_3149', 'IMG_3150', 'IMG_3152', 'IMG_3153', 'IMG_3154'] },
    ],
  },
  {
    appId: 'calomil-1788448647152-2s28',
    inbox: 'inbox/カロミル',
    folder: 'calomil',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'グラフ'],
    sections: [
      { title: 'オンボーディング', files: ['IMG_3156', 'IMG_3157', 'IMG_3158', 'IMG_3159', 'IMG_3160', 'IMG_3161', 'IMG_3162', 'IMG_3163', 'IMG_3164'] },
      { title: '食事記録', files: ['IMG_3165', 'IMG_3166', 'IMG_3167', 'IMG_3168', 'IMG_3169', 'IMG_3170', 'IMG_3171', 'IMG_3172', 'IMG_3173', 'IMG_3174', 'IMG_3175', 'IMG_3176', 'IMG_3177', 'IMG_3178', 'IMG_3189', 'IMG_3190', 'IMG_3191', 'IMG_3193', 'IMG_3194', 'IMG_3195', 'IMG_3196', 'IMG_3197', 'IMG_3198', 'IMG_3199', 'IMG_3200', 'IMG_3201', 'IMG_3202', 'IMG_3203'] },
      { title: '栄養グラフ', files: ['IMG_3179', 'IMG_3180', 'IMG_3181', 'IMG_3182', 'IMG_3183', 'IMG_3184', 'IMG_3185', 'IMG_3186', 'IMG_3187', 'IMG_3188', 'IMG_3236', 'IMG_3237', 'IMG_3238'] },
      { title: '体重・バイタル', files: ['IMG_3204', 'IMG_3205', 'IMG_3206', 'IMG_3207', 'IMG_3208', 'IMG_3209', 'IMG_3210', 'IMG_3211', 'IMG_3212', 'IMG_3213'] },
      { title: '運動', files: ['IMG_3214', 'IMG_3215', 'IMG_3216', 'IMG_3217', 'IMG_3218', 'IMG_3219', 'IMG_3220', 'IMG_3221', 'IMG_3222', 'IMG_3223', 'IMG_3224'] },
      { title: 'チーム', files: ['IMG_3225', 'IMG_3226', 'IMG_3227'] },
      { title: '目標設定・メニュー', files: ['IMG_3228', 'IMG_3229', 'IMG_3230', 'IMG_3231', 'IMG_3232', 'IMG_3233', 'IMG_3234', 'IMG_3235', 'IMG_3239'] },
    ],
  },
  {
    appId: 'twitch-1788448656074-mt47',
    inbox: 'inbox/Twitch',
    folder: 'twitch',
    components: ['カード', 'リスト', 'ヘッダー', 'ボタン', 'ボトム ナビゲーション'],
    sections: [
      { title: 'ホーム・オンボーディング', files: ['IMG_3013', 'IMG_3014', 'IMG_3015', 'IMG_3016', 'IMG_3017', 'IMG_3018'] },
      { title: 'フォロー中', files: ['IMG_3019', 'IMG_3020', 'IMG_3021', 'IMG_3022', 'IMG_3023', 'IMG_3024', 'IMG_3025', 'IMG_3026', 'IMG_3027', 'IMG_3028', 'IMG_3029', 'IMG_3030'] },
      { title: '検索', files: ['IMG_3031', 'IMG_3032', 'IMG_3033', 'IMG_3034', 'IMG_3035', 'IMG_3036'] },
      { title: '配信マネージャー', files: ['IMG_3037', 'IMG_3038', 'IMG_3039', 'IMG_3040', 'IMG_3041', 'IMG_3042', 'IMG_3043', 'IMG_3044', 'IMG_3045', 'IMG_3046', 'IMG_3047', 'IMG_3048'] },
      { title: 'プロフィール・チャンネル', files: ['IMG_3049', 'IMG_3052', 'IMG_3053', 'IMG_3054'] },
      { title: '設定', files: ['IMG_3055', 'IMG_3057', 'IMG_3058', 'IMG_3059'] },
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
      // Support both .PNG and .png
      let src = path.join(inboxDir, `${stem}.PNG`)
      try { await fs.access(src) } catch {
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
  if (idx < 0) { console.warn(`app not found: ${spec.appId}`); continue }
  const app = apps[idx]
  const store = app.sections.find((s) => s.title === 'ストア画像') || app.sections[0]
  const folderPrefix = `/appui-images/${spec.folder}`
  const deviceSections = spec.sections.map((s) =>
    section(s.title, s.files, folderPrefix, spec.components.slice(0, 5))
  )
  app.sections = [store, ...deviceSections]
  app.components = [...new Set([...(app.components || []), ...spec.components])]

  report.push({ name: app.name, converted, sections: deviceSections.length })
  console.log(`${app.name}: ${converted} images, ${deviceSections.length} sections`)
}

await fs.writeFile(APPS_JSON, `${JSON.stringify(apps, null, 2)}\n`, 'utf-8')
console.log(JSON.stringify({ report }, null, 2))
