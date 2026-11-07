import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const INDEX_HTML = path.join(DIST, 'index.html')
const APPS_JSON = path.join(ROOT, 'public/apps.json')

function siteUrl() {
  const raw = (process.env.VITE_SITE_URL || 'http://localhost:5173').trim()
  return raw.replace(/\/$/, '')
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absolute(pathname, origin) {
  const pathName = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${origin}${pathName}`
}

function injectPage(html, { title, description, path: pagePath, image, noindex = false, jsonLd, noscript }) {
  const origin = siteUrl()
  const url = absolute(pagePath, origin)
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : absolute(image, origin)
    : absolute('/favicon.svg', origin)
  const robots = noindex ? 'noindex,nofollow' : 'index,follow'
  const fullTitle = title.includes('アプリUI図鑑') ? title : `${title}｜アプリUI図鑑`

  let next = html
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`)
  next = next.replace(/lang="[^"]*"/i, 'lang="ja"')

  const headTags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="ja_JP" />`,
    `<meta property="og:site_name" content="アプリUI図鑑" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
  ]

  if (jsonLd) {
    const payloads = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    for (const payload of payloads) {
      headTags.push(`<script type="application/ld+json">${JSON.stringify(payload)}</script>`)
    }
  }

  // Replace existing description if present, otherwise inject before </head>
  if (/name="description"/i.test(next)) {
    next = next.replace(/<meta\s+name="description"[^>]*>/i, headTags[0])
    next = next.replace('</head>', `${headTags.slice(1).join('\n    ')}\n  </head>`)
  } else {
    next = next.replace('</head>', `${headTags.join('\n    ')}\n  </head>`)
  }

  if (noscript) {
    const block = `<noscript><main style="font-family:sans-serif;max-width:720px;margin:24px auto;padding:0 16px"><h1>${escapeHtml(
      title,
    )}</h1>${noscript}</main></noscript>`
    if (/<div id="root"><\/div>/i.test(next)) {
      next = next.replace('<div id="root"></div>', `<div id="root"></div>\n    ${block}`)
    } else {
      next = next.replace('</body>', `${block}\n  </body>`)
    }
  }

  return next
}

async function writePage(relPath, html) {
  const outPath = path.join(DIST, relPath)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, html, 'utf-8')
}

async function main() {
  const template = await fs.readFile(INDEX_HTML, 'utf-8')
  const apps = JSON.parse(await fs.readFile(APPS_JSON, 'utf-8'))
  const origin = siteUrl()
  const urls = ['/', '/about', '/privacy']

  const homeHtml = injectPage(template, {
    title: 'アプリUI図鑑｜アプリデザイン参考ギャラリー',
    description:
      '日本の人気アプリの実機UIを集めたデザイン参考ギャラリー。カテゴリやコンポーネントで探し、画面構成のアイデアを素早く比較できます。',
    path: '/',
    noscript: '<p>アプリデザインの参考になるギャラリーサイトです。JavaScript を有効にすると一覧を閲覧できます。</p>',
  })
  await fs.writeFile(INDEX_HTML, homeHtml, 'utf-8')

  await writePage(
    'about/index.html',
    injectPage(template, {
      title: 'このサイトについて',
      description: 'アプリUI図鑑についての説明です。',
      path: '/about',
      noscript: '<p>アプリUI図鑑は実機UIの参考ギャラリーです。</p>',
    }),
  )
  urls.push('/about')

  await writePage(
    'privacy/index.html',
    injectPage(template, {
      title: 'プライバシー',
      description: 'アプリUI図鑑のプライバシー方針です。',
      path: '/privacy',
      noscript: '<p>お気に入りは端末内に保存されます。</p>',
    }),
  )

  const categories = new Set()
  const components = new Set()

  for (const app of apps) {
    if (app.hidden) continue
    const slug = app.slug
    if (!slug) continue
    const pagePath = `/apps/${slug}`
    urls.push(pagePath)
    const description = String(app.description || `${app.name}のUI画面ギャラリー`).slice(0, 160)
    const html = injectPage(template, {
      title: `${app.name}のUI`,
      description,
      path: pagePath,
      image: app.iconUrl,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: app.name,
        description,
        applicationCategory: (app.categories || [])[0] || 'MultimediaApplication',
        operatingSystem: 'iOS',
        url: absolute(pagePath, origin),
        image: app.iconUrl ? absolute(app.iconUrl, origin) : undefined,
      },
      noscript: `<p>${escapeHtml(description)}</p><p>カテゴリ: ${escapeHtml(
        (app.categories || []).join('、'),
      )}</p>`,
    })
    await writePage(`apps/${slug}/index.html`, html)

    for (const category of app.categories || []) categories.add(category)
    for (const component of app.components || []) components.add(component)
  }

  for (const category of categories) {
    const pagePath = `/category/${encodeURIComponent(category)}`
    urls.push(pagePath)
    await writePage(
      `category/${encodeURIComponent(category)}/index.html`,
      injectPage(template, {
        title: `${category}アプリのUI参考`,
        description: `${category}カテゴリのアプリUIを集めた参考ギャラリーです。`,
        path: pagePath,
        noscript: `<p>${escapeHtml(category)}カテゴリのアプリUI一覧です。</p>`,
      }),
    )
  }

  for (const component of components) {
    const pagePath = `/component/${encodeURIComponent(component)}`
    urls.push(pagePath)
    await writePage(
      `component/${encodeURIComponent(component)}/index.html`,
      injectPage(template, {
        title: `${component}のUIデザイン例`,
        description: `${component}コンポーネントの実例を集めた参考ギャラリーです。`,
        path: pagePath,
        noscript: `<p>${escapeHtml(component)}コンポーネントの実例一覧です。</p>`,
      }),
    )
  }

  const uniqueUrls = [...new Set(urls)]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (u) => `  <url>
    <loc>${escapeHtml(absolute(u, origin))}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>
`

  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf-8')
  await fs.writeFile(
    path.join(ROOT, 'public/sitemap.xml'),
    sitemap,
    'utf-8',
  )

  // robots.txt sitemap absolute
  const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${absolute('/sitemap.xml', origin)}
`
  await fs.writeFile(path.join(DIST, 'robots.txt'), robots, 'utf-8')
  await fs.writeFile(path.join(ROOT, 'public/robots.txt'), robots, 'utf-8')

  console.log(
    JSON.stringify(
      {
        ok: true,
        pages: uniqueUrls.length,
        apps: apps.length,
        siteUrl: origin,
      },
      null,
      2,
    ),
  )
}

await main()
