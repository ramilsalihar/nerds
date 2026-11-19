// Renders the 1200×630 share card used as og:image / twitter:image.
// GET /api/og?id=<projectId>&v=<updatedAt ms>  (v only busts caches)

import { ImageResponse } from '@vercel/og'
import { cloudinaryVariant, fetchShareSummary, SHOW_RANK_UP_TO, truncate, type ShareSummary } from './_lib/share.js'

export const config = { runtime: 'edge' }

const WIDTH = 1200
const HEIGHT = 630

// Satori renders plain element objects; this keeps the file free of JSX
// so it needs no React runtime or TSX config.
type Style = Record<string, string | number>
interface El {
  type: string
  props: { style?: Style; children?: Child; src?: string; width?: number; height?: number }
}
type Child = El | string | (El | string | null | false)[] | null

function h(type: string, style: Style, children?: Child, extra: Omit<El['props'], 'style' | 'children'> = {}): El {
  return { type, props: { style, children, ...extra } }
}

// --- Fonts (Inter, Latin + Cyrillic; Satori can't read woff2) -------------

const FONT_BASE = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.1.0/files'
const FONT_FILES = [
  { subset: 'latin', weight: 500 },
  { subset: 'latin', weight: 800 },
  { subset: 'cyrillic', weight: 500 },
  { subset: 'cyrillic', weight: 800 },
] as const

let fontsPromise: Promise<{ name: string; data: ArrayBuffer; weight: 500 | 800; style: 'normal' }[]> | null = null

function loadFonts() {
  fontsPromise ??= Promise.all(
    FONT_FILES.map(async ({ subset, weight }) => {
      const res = await fetch(`${FONT_BASE}/inter-${subset}-${weight}-normal.woff`)
      if (!res.ok) throw new Error(`font ${subset}-${weight}: ${res.status}`)
      // Distinct names per subset: Satori falls back between families, not
      // between same-named files.
      return { name: subset === 'latin' ? 'Inter' : 'Inter Cyrillic', data: await res.arrayBuffer(), weight, style: 'normal' as const }
    }),
  ).catch((err) => {
    fontsPromise = null
    throw err
  })
  return fontsPromise
}

// --- Images ----------------------------------------------------------------

// Fetch images ourselves so a broken or unsupported image falls back to the
// gradient card instead of failing the whole render.
async function toDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    const type = res.headers.get('content-type') ?? ''
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    }
    return `data:${type.split(';')[0]};base64,${btoa(binary)}`
  } catch {
    return null
  }
}

// --- Visual pieces ---------------------------------------------------------

// Same 9 hues as the app's accent set (styles/tokens.css "-strong" tier).
const GRADIENTS = [
  ['#207cb7', '#4640de'],
  ['#1f8a4c', '#207cb7'],
  ['#4640de', '#8a3ffc'],
  ['#c25400', '#d6336c'],
  ['#d6336c', '#8a3ffc'],
  ['#8a3ffc', '#4640de'],
  ['#c92a2a', '#c25400'],
  ['#0f7c80', '#1f8a4c'],
  ['#a86b00', '#c25400'],
]

function gradientFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const [from, to] = GRADIENTS[hash % GRADIENTS.length]
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

function pill(text: string, background: string, color = '#ffffff'): El {
  return h(
    'div',
    {
      display: 'flex',
      padding: '10px 22px',
      borderRadius: 999,
      background,
      color,
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },
    text,
  )
}

function wordmark(host: string): El {
  return h('div', { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }, [
    h('div', { display: 'flex', fontSize: 40, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }, 'nerds'),
    h('div', { display: 'flex', fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }, host),
  ])
}

function avatar(name: string, src: string | null, seed: string): El {
  const size = 72
  const base: Style = {
    width: size,
    height: size,
    borderRadius: size,
    border: '3px solid rgba(255,255,255,0.9)',
  }
  if (src) return h('img', { ...base, objectFit: 'cover' }, null, { src, width: size, height: size })
  return h(
    'div',
    {
      ...base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: gradientFor(seed),
      color: '#ffffff',
      fontSize: 28,
      fontWeight: 800,
    },
    initials(name),
  )
}

function projectCard(project: ShareSummary, hero: string | null, avatarSrc: string | null, host: string): El {
  const badges: El[] = []
  if (project.rank <= SHOW_RANK_UP_TO) {
    badges.push(pill(`#${project.rank} on the leaderboard`, '#ffd43b', '#1a1446'))
  }
  badges.push(pill(project.type === 'startup' ? 'Startup' : 'Outsource', 'rgba(255,255,255,0.18)'))
  if (project.deployed) badges.push(pill('Live', '#2f9e44'))

  const likes = project.likeCount
  const studentName = project.student?.name ?? 'A nerds student'
  const titleSize = project.title.length > 40 ? 64 : 80

  return h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      position: 'relative',
      background: gradientFor(project.id),
      fontFamily: 'Inter, "Inter Cyrillic"',
    },
    [
      hero && h('img', { position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, objectFit: 'cover' }, null, { src: hero, width: WIDTH, height: HEIGHT }),
      // Scrim: keeps white text readable over any screenshot.
      h('div', {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        background: hero
          ? 'linear-gradient(to top, rgba(14,10,48,0.96) 0%, rgba(14,10,48,0.7) 45%, rgba(14,10,48,0.2) 100%)'
          : 'linear-gradient(to top, rgba(14,10,48,0.55) 0%, rgba(14,10,48,0) 70%)',
      }),
      h(
        'div',
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          padding: 64,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
        [
          h('div', { display: 'flex', gap: 14 }, badges),
          h('div', { display: 'flex', flexDirection: 'column', gap: 28 }, [
            h(
              'div',
              {
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              },
              truncate(project.title, 70),
            ),
            h('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, [
              h('div', { display: 'flex', alignItems: 'center', gap: 20 }, [
                avatar(studentName, avatarSrc, project.student?.id ?? project.id),
                h('div', { display: 'flex', flexDirection: 'column' }, [
                  h('div', { display: 'flex', fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }, 'Built by'),
                  h('div', { display: 'flex', fontSize: 32, fontWeight: 800, color: '#ffffff' }, truncate(studentName, 32)),
                ]),
                likes > 0 &&
                  h(
                    'div',
                    { display: 'flex', marginLeft: 16, fontSize: 28, fontWeight: 800, color: '#ff8fab' },
                    `${likes} ${likes === 1 ? 'like' : 'likes'}`,
                  ),
              ]),
              wordmark(host),
            ]),
          ]),
        ],
      ),
    ],
  )
}

function fallbackCard(host: string): El {
  return h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 64,
      background: 'linear-gradient(135deg, #2f2b9c 0%, #4640de 100%)',
      fontFamily: 'Inter, "Inter Cyrillic"',
      color: '#ffffff',
    },
    [
      h('div', { display: 'flex', fontSize: 40, fontWeight: 800 }, 'nerds'),
      h('div', { display: 'flex', flexDirection: 'column', gap: 16 }, [
        h('div', { display: 'flex', fontSize: 80, fontWeight: 800, letterSpacing: '-0.03em' }, 'See what students build.'),
        h('div', { display: 'flex', fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }, host),
      ]),
    ],
  )
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') ?? ''
  const host = url.host

  const [fonts, project] = await Promise.all([loadFonts(), id ? fetchShareSummary(id) : null])

  let element: El
  if (project) {
    const [hero, avatarSrc] = await Promise.all([
      toDataUrl(project.imageUrl && cloudinaryVariant(project.imageUrl, `w_${WIDTH},h_${HEIGHT},c_fill,g_auto,f_jpg,q_80`)),
      toDataUrl(project.student?.avatarUrl && cloudinaryVariant(project.student.avatarUrl, 'w_144,h_144,c_fill,g_face,f_jpg')),
    ])
    element = projectCard(project, hero, avatarSrc, host)
  } else {
    element = fallbackCard(host)
  }

  // ImageResponse types its first arg as a React element; our plain objects
  // are the same shape at runtime.
  return new ImageResponse(element as unknown as ConstructorParameters<typeof ImageResponse>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts,
    headers: {
      // Rank can change without updatedAt changing, so don't mark immutable.
      'Cache-Control': project
        ? 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
        : 'public, max-age=0, s-maxage=30',
    },
  })
}
