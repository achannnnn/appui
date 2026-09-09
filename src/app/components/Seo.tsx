import { Helmet } from 'react-helmet-async'
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from '../lib/site'

type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title}｜${SITE_NAME}` : `${SITE_NAME}｜アプリデザイン参考ギャラリー`
  const url = absoluteUrl(path)
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : absoluteUrl(image)
    : absoluteUrl('/favicon.svg')
  const robots = noindex ? 'noindex,nofollow' : 'index,follow'
  const payloads = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <Helmet>
      <html lang="ja" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ja_JP" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {payloads.map((payload, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(payload)}
        </script>
      ))}
    </Helmet>
  )
}
