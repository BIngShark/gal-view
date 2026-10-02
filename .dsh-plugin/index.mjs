// gal-view Node half —— 本地神经语音合成（GAL 视窗台词朗读）。
//
// 复用这台机器上已就绪的 Python + edge_tts（默认 zh-CN-XiaoyiNeural，撒娇萝莉音），
// 合成结果按「文本哈希」缓存到插件根目录下的 .voice-cache/，同一句只合成一次。
//
// 路由（只读、幂等）：
//   GET /gal-view-voice?text=<urlencoded>   → audio/mpeg
//   GET /gal-view-voice/health              → JSON 状态
//
// 可用环境变量覆盖：GAL_VIEW_VOICE / GAL_VIEW_PITCH / GAL_VIEW_RATE / GAL_VIEW_PYTHON
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'gal-view'

// 宿主半边唯一需要的服务：Web 服务器（用于注册语音路由）。
export const inject = ['webServer']

const HERE = dirname(fileURLToPath(import.meta.url))
const CACHE_DIR = join(HERE, '..', '.voice-cache')
const ROUTE = '/gal-view-voice'
const ART_ROUTE = '/gal-view-art'
const ART_DIR = join(HERE, '..', 'art')
/** 只服务白名单里的内置立绘，避免任何目录穿越。 */
const ART_ITEMS = [
  { name: 'galgame-neutral.webp', label: 'galgame 模式的女仆立绘', mime: 'image/webp' },
]

// Python 解释器自动探测：环境变量 → 常见安装位置 → PATH 上的 python。
// 这样插件在别人机器上装好即用（对方只需 pip install edge-tts）。
const PYTHON = (() => {
  if (process.env.GAL_VIEW_PYTHON) return process.env.GAL_VIEW_PYTHON
  const home = process.env.USERPROFILE || process.env.HOME || ''
  const candidates = []
  if (process.platform === 'win32') {
    for (const v of ['313', '312', '311', '310', '39', '38']) {
      candidates.push(join(home, 'AppData', 'Local', 'Programs', 'Python', 'Python' + v, 'python.exe'))
    }
    candidates.push(
      'C:\\Python313\\python.exe', 'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe', 'C:\\Python310\\python.exe',
      join(home, 'anaconda3', 'python.exe'), join(home, 'miniconda3', 'python.exe'),
    )
  } else {
    candidates.push('/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3')
  }
  for (const item of candidates) {
    try { if (existsSync(item)) return item } catch (e) {}
  }
  return process.platform === 'win32' ? 'python' : 'python3'
})()
const VOICE = process.env.GAL_VIEW_VOICE ?? 'zh-CN-XiaoyiNeural'
const PITCH = process.env.GAL_VIEW_PITCH ?? '+35Hz'
const RATE = process.env.GAL_VIEW_RATE ?? '+20%'
const TIMEOUT_MS = 30000

/** 同一句并发请求共享一次合成。 */
const inFlight = new Map()

function normalize(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, 400)
}

const VOICE_NAME = /^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$/

function pickVoice(raw) {
  const name = String(raw ?? '').trim()
  return VOICE_NAME.test(name) ? name : VOICE
}

const RATE_OK = /^[+-]?[0-9]{1,3}%$/

/** 逐次请求可指定语速（-50% ~ +80%），非法值回落到默认。 */
function pickRate(raw) {
  const name = String(raw ?? '').trim()
  if (!RATE_OK.test(name)) return RATE
  const num = Number(name.replace('%', ''))
  if (!Number.isFinite(num) || num < -50 || num > 80) return RATE
  return (num >= 0 ? '+' : '') + num + '%'
}

function cacheFile(text, voice, rate) {
  const hash = createHash('sha256').update(voice + '\u0000' + rate + '\u0000' + text).digest('hex').slice(0, 32)
  return { file: join(CACHE_DIR, hash + '.mp3'), etag: '"' + hash + '"' }
}

function synthesize(text, file, voice, rate) {
  return new Promise((resolve, reject) => {
    try {
      mkdirSync(CACHE_DIR, { recursive: true })
    } catch (error) {
      reject(error)
      return
    }
    const args = [
      '-m', 'edge_tts',
      '--voice', voice,
      '--pitch=' + PITCH,
      '--rate=' + rate,
      '--text', text,
      '--write-media', file,
    ]
    let settled = false
    const child = spawn(PYTHON, args, { stdio: 'ignore', windowsHide: true })
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try { child.kill() } catch (error) { /* ignore */ }
      reject(new Error('edge_tts timeout'))
    }, TIMEOUT_MS)
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.on('exit', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code === 0 && existsSync(file)) resolve()
      else reject(new Error('edge_tts exit ' + code))
    })
  })
}

async function ensureAudio(text, file, voice, rate) {
  if (existsSync(file)) return
  const running = inFlight.get(file)
  if (running !== undefined) return running
  const task = synthesize(text, file, voice, rate)
    .catch((error) => {
      try { if (existsSync(file)) unlinkSync(file) } catch (inner) { /* ignore */ }
      throw error
    })
    .finally(() => { inFlight.delete(file) })
  inFlight.set(file, task)
  return task
}

export function apply(ctx) {
  // 注册失败属于插件边界：报告并停手，绝不让异常逃进宿主启动流程。
  try {
    ctx.effect(
      () => ctx.webServer.register({ kind: 'prefix', path: ROUTE, handler: handle }),
      'gal-view: voice synthesis',
    )
    ctx.effect(
      () => ctx.webServer.register({ kind: 'prefix', path: ART_ROUTE, handler: handleArt }),
      'gal-view: built-in portraits',
    )
  } catch (error) {
    ctx.logger?.warn?.('gal-view voice route not registered: ' + (error?.message ?? error))
  }
}

async function handleArt(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  if (url.pathname.endsWith('/list')) {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({
      items: ART_ITEMS.map((item) => ({
        name: item.name,
        label: item.label,
        url: ART_ROUTE + '/' + item.name,
      })),
    }))
    return
  }
  const name = url.pathname.split('/').pop()
  const item = ART_ITEMS.find((entry) => entry.name === name)
  if (item === undefined) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('gal-view art: unknown item')
    return
  }
  const file = join(ART_DIR, item.name)
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('gal-view art: file missing')
    return
  }
  const bytes = readFileSync(file)
  res.writeHead(200, {
    'content-type': item.mime,
    'content-length': String(bytes.length),
    'cache-control': 'no-cache',
  })
  res.end(bytes)
}

async function handle(req, res) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const text = normalize(url.searchParams.get('text'))
  const voice = pickVoice(url.searchParams.get('voice'))
  const rate = pickRate(url.searchParams.get('rate'))

  if (url.pathname.endsWith('/health') || url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({
      ok: true,
      voice: VOICE, voiceParam: true,
      pitch: PITCH,
      rate: RATE,
      python: PYTHON,
      pythonExists: existsSync(PYTHON),
      cacheDir: CACHE_DIR,
    }))
    return
  }

  if (text === '') {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('gal-view voice: missing text')
    return
  }

  const { file, etag } = cacheFile(text, voice, rate)
  if (req.headers['if-none-match'] === etag && existsSync(file)) {
    res.writeHead(304, { etag, 'cache-control': 'no-cache' })
    res.end()
    return
  }

  try {
    await ensureAudio(text, file, voice, rate)
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('gal-view voice failed: ' + (error?.message ?? String(error)))
    return
  }

  let bytes
  try {
    bytes = readFileSync(file)
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('gal-view voice unreadable')
    return
  }

  res.writeHead(200, {
    'content-type': 'audio/mpeg',
    'content-length': String(bytes.length),
    'cache-control': 'no-cache',
    etag,
  })
  res.end(bytes)
}