import { defineConfig } from 'vite'
import path from 'path'
import { promises as fs } from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

const MIME_EXT = {
  'image/webp': '.webp',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

const CONVERTIBLE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/webp',
])

/** List cards ~146 CSS px → ~600px (~4×). Detail modal ~450 CSS px → ~1200px (~2–3×). */
const LIST_MAX_WIDTH = 600
const DETAIL_MAX_WIDTH = 1200
const DISPLAY_WEBP_QUALITY = 90

function sanitizeSegment(value, fallback = 'item') {
  const cleaned = String(value || '')
    .normalize('NFKC')
    .replace(/[\/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned || fallback
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl)
  if (!match) return null
  const mime = (match[1] || 'application/octet-stream').toLowerCase()
  const isBase64 = Boolean(match[2])
  const payload = match[3] || ''
  const buffer = isBase64
    ? Buffer.from(payload, 'base64')
    : Buffer.from(decodeURIComponent(payload), 'utf8')
  return { mime, buffer }
}

function extensionFor(mime, filename) {
  const fromName = path.extname(filename || '').toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  return MIME_EXT[mime] || '.bin'
}

function withWebpExtension(filename) {
  const base = path.basename(String(filename || 'image'), path.extname(String(filename || '')))
  return `${sanitizeSegment(base, 'image')}.webp`
}

async function uniquePath(dir, filename) {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  let candidate = path.join(dir, filename)
  let i = 2
  while (true) {
    try {
      await fs.access(candidate)
      candidate = path.join(dir, `${base}-${i}${ext}`)
      i += 1
    } catch {
      return candidate
    }
  }
}

function variantSiblingPath(filePath, variant) {
  const ext = path.extname(filePath)
  const base = filePath.slice(0, filePath.length - ext.length)
  return `${base}.${variant}${ext}`
}

async function toMasterWebp(buffer) {
  // Archive master: q100 (near-visually lossless for UI screenshots)
  return sharp(buffer, { animated: false })
    .rotate()
    .webp({
      quality: 100,
      alphaQuality: 100,
      effort: 4,
      smartSubsample: false,
    })
    .toBuffer()
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

async function writeDisplayVariants(filePath, masterBuffer) {
  const listBuffer = await toDisplayWebp(masterBuffer, LIST_MAX_WIDTH)
  const detailBuffer = await toDisplayWebp(masterBuffer, DETAIL_MAX_WIDTH)
  const listPath = variantSiblingPath(filePath, 'list')
  const detailPath = variantSiblingPath(filePath, 'detail')
  await fs.writeFile(listPath, listBuffer)
  await fs.writeFile(detailPath, detailBuffer)
  // Remove legacy single display variant if present
  const legacy = variantSiblingPath(filePath, 'display')
  await fs.unlink(legacy).catch(() => {})
  return { listPath, detailPath }
}

async function writeImageBuffer(appId, filename, buffer, mime) {
  const safeAppId = sanitizeSegment(appId || 'uploads', 'uploads')
  const appDir = path.resolve(__dirname, 'public/appui-images', safeAppId)
  await fs.mkdir(appDir, { recursive: true })

  let outputBuffer = buffer
  let outputMime = mime
  let outputName = sanitizeSegment(filename || `image${extensionFor(mime)}`, `image${extensionFor(mime)}`)
  let converted = false
  let listRel = null
  let detailRel = null

  try {
    if (CONVERTIBLE_MIME.has(mime) || mime === 'image/webp') {
      outputBuffer = await toMasterWebp(buffer)
      outputMime = 'image/webp'
      outputName = withWebpExtension(filename)
      converted = true
    }
  } catch (error) {
    console.warn('[admin-upload] WebP conversion failed, saving original:', error instanceof Error ? error.message : error)
  }

  if (!path.extname(outputName)) {
    outputName = `${outputName}${extensionFor(outputMime)}`
  }

  const filePath = await uniquePath(appDir, outputName)
  await fs.writeFile(filePath, outputBuffer)

  try {
    const variants = await writeDisplayVariants(filePath, outputBuffer)
    listRel = path.relative(path.resolve(__dirname, 'public'), variants.listPath).split(path.sep).join('/')
    detailRel = path.relative(path.resolve(__dirname, 'public'), variants.detailPath).split(path.sep).join('/')
  } catch (error) {
    console.warn('[admin-upload] display variant failed:', error instanceof Error ? error.message : error)
  }

  const rel = path.relative(path.resolve(__dirname, 'public'), filePath).split(path.sep).join('/')
  return {
    url: `/${rel}`,
    displayUrl: listRel ? `/${listRel}` : `/${rel}`,
    listUrl: listRel ? `/${listRel}` : `/${rel}`,
    detailUrl: detailRel ? `/${detailRel}` : `/${rel}`,
    filename: path.basename(filePath),
    mimeType: outputMime,
    converted,
  }
}

async function materializeDataUrl(dataUrl, appId, preferredName) {
  const parsed = parseDataUrl(dataUrl)
  if (!parsed) return { url: dataUrl, filename: preferredName || '', converted: false }
  return writeImageBuffer(appId, preferredName || `image${extensionFor(parsed.mime)}`, parsed.buffer, parsed.mime)
}

async function materializeAppImages(appEntry) {
  if (!appEntry || typeof appEntry !== 'object') return appEntry
  const appId = sanitizeSegment(appEntry.id || appEntry.name || 'app', 'app')

  if (typeof appEntry.iconUrl === 'string' && appEntry.iconUrl.startsWith('data:')) {
    const result = await materializeDataUrl(appEntry.iconUrl, appId, 'icon.png')
    appEntry.iconUrl = result.url
  }

  for (const section of appEntry.sections || []) {
    for (const image of section.images || []) {
      if (typeof image?.src === 'string' && image.src.startsWith('data:')) {
        const result = await materializeDataUrl(image.src, appId, image.filename || `${image.id || 'image'}.png`)
        image.src = result.url
        if (result.filename) {
          image.filename = result.filename
        }
      }
    }
  }

  return appEntry
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function mimeFromFilename(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.bmp') return 'image/bmp'
  if (ext === '.tif' || ext === '.tiff') return 'image/tiff'
  if (ext === '.heic' || ext === '.heif') return 'image/heic'
  return 'application/octet-stream'
}

function isImageFilename(filename) {
  return /\.(png|jpe?g|webp|gif|bmp|tiff?|heic|heif)$/i.test(filename)
}

const INBOX_DIR = path.resolve(__dirname, 'inbox')

async function ensureInboxDir() {
  await fs.mkdir(INBOX_DIR, { recursive: true })
}

function resolveInboxFolder(folder) {
  const raw = String(folder || '').trim()
  if (!raw || raw === '.' || raw === '/') {
    return { key: '', dir: INBOX_DIR }
  }
  const safe = sanitizeSegment(raw, '')
  if (!safe || safe.includes('..')) {
    throw new Error('invalid folder')
  }
  return { key: safe, dir: path.join(INBOX_DIR, safe) }
}

async function listImagesInDir(dir, folderKey) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.') || !isImageFilename(entry.name)) {
      continue
    }
    const fullPath = path.join(dir, entry.name)
    const stat = await fs.stat(fullPath)
    const previewPath = folderKey
      ? `${encodeURIComponent(folderKey)}/${encodeURIComponent(entry.name)}`
      : encodeURIComponent(entry.name)
    files.push({
      name: entry.name,
      folder: folderKey,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      previewUrl: `/inbox-preview/${previewPath}`,
    })
  }
  files.sort((a, b) => b.mtimeMs - a.mtimeMs || a.name.localeCompare(b.name))
  return files
}

async function listInboxFolders() {
  await ensureInboxDir()
  const entries = await fs.readdir(INBOX_DIR, { withFileTypes: true })
  const folders = []

  const rootFiles = await listImagesInDir(INBOX_DIR, '')
  folders.push({
    name: '',
    label: 'ルート（フォルダなし）',
    fileCount: rootFiles.length,
  })

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) {
      continue
    }
    const key = sanitizeSegment(entry.name, '')
    if (!key) continue
    const files = await listImagesInDir(path.join(INBOX_DIR, entry.name), key)
    folders.push({
      name: key,
      label: entry.name,
      fileCount: files.length,
    })
  }

  folders.sort((a, b) => {
    if (!a.name) return -1
    if (!b.name) return 1
    return a.label.localeCompare(b.label, 'ja')
  })

  return folders
}

async function listInboxFiles(folder = '') {
  const { key, dir } = resolveInboxFolder(folder)
  if (key) {
    await fs.mkdir(dir, { recursive: true })
  } else {
    await ensureInboxDir()
  }
  return listImagesInDir(dir, key)
}

function adminAppsApi() {
  return {
    name: 'admin-apps-api',
    configureServer(server) {
      server.middlewares.use('/inbox-preview', async (req, res, next) => {
        try {
          const rawPath = decodeURIComponent((req.url || '/').replace(/^\//, ''))
          const parts = rawPath.split('/').filter(Boolean)
          if (parts.length === 0 || parts.length > 2) {
            res.statusCode = 404
            res.end('Not found')
            return
          }

          let filePath
          if (parts.length === 1) {
            const safeName = path.basename(parts[0])
            if (!safeName || !isImageFilename(safeName)) {
              res.statusCode = 404
              res.end('Not found')
              return
            }
            filePath = path.join(INBOX_DIR, safeName)
          } else {
            const folder = sanitizeSegment(parts[0], '')
            const safeName = path.basename(parts[1])
            if (!folder || !safeName || !isImageFilename(safeName)) {
              res.statusCode = 404
              res.end('Not found')
              return
            }
            filePath = path.join(INBOX_DIR, folder, safeName)
          }

          const data = await fs.readFile(filePath)
          res.statusCode = 200
          res.setHeader('Content-Type', mimeFromFilename(path.basename(filePath)))
          res.setHeader('Cache-Control', 'no-store')
          res.end(data)
        } catch {
          next()
        }
      })

      server.middlewares.use('/api/admin/appstore/search', async (req, res) => {
        if (req.method !== 'GET') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }

        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const q = (url.searchParams.get('q') || '').trim()
          const country = (url.searchParams.get('country') || 'jp').trim() || 'jp'
          if (!q) {
            sendJson(res, 400, { error: 'q is required' })
            return
          }

          const endpoint = new URL('https://itunes.apple.com/search')
          endpoint.searchParams.set('term', q)
          endpoint.searchParams.set('entity', 'software')
          endpoint.searchParams.set('country', country)
          endpoint.searchParams.set('limit', '12')
          endpoint.searchParams.set('lang', 'ja_jp')

          const response = await fetch(endpoint)
          if (!response.ok) {
            throw new Error(`App Store search failed: ${response.status}`)
          }
          const data = await response.json()
          const results = Array.isArray(data.results)
            ? data.results.map((item) => ({
                trackId: item.trackId,
                trackName: item.trackName || '',
                description: item.description || '',
                artworkUrl512: item.artworkUrl512 || item.artworkUrl100 || '',
                trackViewUrl: item.trackViewUrl || '',
                primaryGenreName: item.primaryGenreName || '',
                sellerName: item.sellerName || item.artistName || '',
              }))
            : []

          sendJson(res, 200, { ok: true, results })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to search App Store' })
        }
      })

      server.middlewares.use('/api/admin/inbox/import', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }

        try {
          const body = JSON.parse(await readRequestBody(req))
          const appId = sanitizeSegment(body.appId || 'uploads', 'uploads')
          const filenames = Array.isArray(body.filenames) ? body.filenames.map(String) : []
          const deleteAfter = body.deleteAfter === true
          const { key: folderKey, dir: folderDir } = resolveInboxFolder(body.folder || '')

          if (filenames.length === 0) {
            sendJson(res, 400, { error: 'filenames is required' })
            return
          }

          await fs.mkdir(folderDir, { recursive: true })
          const imported = []

          for (const name of filenames) {
            const safeName = path.basename(name)
            if (!safeName || !isImageFilename(safeName)) {
              continue
            }
            const sourcePath = path.join(folderDir, safeName)
            const buffer = await fs.readFile(sourcePath)
            const mime = mimeFromFilename(safeName)
            const result = await writeImageBuffer(appId, safeName, buffer, mime)
            imported.push({
              sourceName: safeName,
              folder: folderKey,
              url: result.url,
              filename: result.filename,
              mimeType: result.mimeType,
              converted: result.converted,
            })
            if (deleteAfter) {
              await fs.unlink(sourcePath).catch(() => {})
            }
          }

          // Remove empty app folder after import (keep inbox root)
          if (deleteAfter && folderKey) {
            const remain = await fs.readdir(folderDir).catch(() => [])
            if (remain.filter((name) => !name.startsWith('.')).length === 0) {
              await fs.rmdir(folderDir).catch(() => {})
            }
          }

          sendJson(res, 200, { ok: true, imported })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to import inbox images' })
        }
      })

      server.middlewares.use('/api/admin/inbox/folders', async (req, res) => {
        if (req.method === 'POST') {
          try {
            const body = JSON.parse(await readRequestBody(req))
            const { key, dir } = resolveInboxFolder(body.name || body.folder || '')
            if (!key) {
              sendJson(res, 400, { error: 'folder name is required' })
              return
            }
            await fs.mkdir(dir, { recursive: true })
            sendJson(res, 200, { ok: true, folder: key })
          } catch (error) {
            sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to create folder' })
          }
          return
        }

        sendJson(res, 405, { error: 'method not allowed' })
      })

      server.middlewares.use('/api/admin/inbox', async (req, res) => {
        if (req.method === 'GET') {
          try {
            const url = new URL(req.url || '/', 'http://localhost')
            const folder = url.searchParams.get('folder') || ''
            const [folders, files] = await Promise.all([
              listInboxFolders(),
              listInboxFiles(folder),
            ])
            sendJson(res, 200, {
              ok: true,
              folder,
              folders,
              files,
              inboxPath: folder ? `inbox/${folder}/` : 'inbox/',
            })
          } catch (error) {
            sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to list inbox' })
          }
          return
        }

        if (req.method === 'DELETE') {
          try {
            const body = JSON.parse((await readRequestBody(req)) || '{}')
            const filenames = Array.isArray(body.filenames) ? body.filenames.map(String) : null
            const { key: folderKey, dir: folderDir } = resolveInboxFolder(body.folder || '')
            await fs.mkdir(folderDir, { recursive: true })

            if (filenames) {
              for (const name of filenames) {
                const safeName = path.basename(name)
                if (!safeName || safeName.startsWith('.')) continue
                await fs.unlink(path.join(folderDir, safeName)).catch(() => {})
              }
            } else {
              const files = await listInboxFiles(folderKey)
              for (const file of files) {
                await fs.unlink(path.join(folderDir, file.name)).catch(() => {})
              }
            }

            sendJson(res, 200, { ok: true })
          } catch (error) {
            sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to clear inbox' })
          }
          return
        }

        sendJson(res, 405, { error: 'method not allowed' })
      })

      server.middlewares.use('/api/admin/upload', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }

        try {
          const body = JSON.parse(await readRequestBody(req))
          const appId = sanitizeSegment(body.appId || 'uploads', 'uploads')
          const filename = String(body.filename || 'image.webp')
          let buffer
          let mime = String(body.mimeType || 'application/octet-stream')

          if (typeof body.dataUrl === 'string' && body.dataUrl.startsWith('data:')) {
            const parsed = parseDataUrl(body.dataUrl)
            if (!parsed) throw new Error('invalid dataUrl')
            buffer = parsed.buffer
            mime = parsed.mime
          } else if (typeof body.contentBase64 === 'string') {
            buffer = Buffer.from(body.contentBase64, 'base64')
          } else {
            throw new Error('dataUrl or contentBase64 is required')
          }

          const result = await writeImageBuffer(appId, filename, buffer, mime)
          sendJson(res, 200, {
            ok: true,
            url: result.url,
            filename: result.filename,
            mimeType: result.mimeType,
            converted: result.converted,
          })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to upload image' })
        }
      })

      server.middlewares.use('/api/admin/split-apps', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }
        try {
          const { splitAppsData } = await import('./scripts/split-apps-data.mjs')
          const result = await splitAppsData()
          sendJson(res, 200, { ok: true, ...result })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to split apps' })
        }
      })

      server.middlewares.use('/api/admin/apps', async (req, res) => {
        if (req.method !== 'POST' && req.method !== 'DELETE') {
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }

        try {
          const body = await readRequestBody(req)
          const filePath = path.resolve(__dirname, 'public/apps.json')
          const current = await fs.readFile(filePath, 'utf-8').catch(() => '[]')
          const parsed = JSON.parse(current)
          const apps = Array.isArray(parsed) ? parsed : []

          if (req.method === 'DELETE') {
            const payload = JSON.parse(body)
            const nextApps = apps.filter((item) => !(item && typeof item === 'object' && item.id === payload.id))
            await fs.writeFile(filePath, JSON.stringify(nextApps, null, 2) + '\n', 'utf-8')
            try {
              const { splitAppsData } = await import('./scripts/split-apps-data.mjs')
              await splitAppsData()
            } catch (splitError) {
              console.warn('split-apps-data failed', splitError)
            }
            sendJson(res, 200, { ok: true })
            return
          }

          const appEntry = await materializeAppImages(JSON.parse(body))
          const existingIndex = apps.findIndex((item) => item && typeof item === 'object' && item.id === appEntry.id)
          if (existingIndex >= 0) {
            apps[existingIndex] = appEntry
          } else {
            apps.push(appEntry)
          }

          await fs.writeFile(filePath, JSON.stringify(apps, null, 2) + '\n', 'utf-8')
          try {
            const { splitAppsData } = await import('./scripts/split-apps-data.mjs')
            await splitAppsData()
          } catch (splitError) {
            console.warn('split-apps-data failed', splitError)
          }
          sendJson(res, 200, { ok: true, app: appEntry })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : 'failed to save app' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    adminAppsApi(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
