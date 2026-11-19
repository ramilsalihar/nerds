// Serves /p/:id (via the rewrite in vercel.json). Returns the normal SPA shell
// with Open Graph / Twitter meta tags injected, so link previews on X,
// LinkedIn, Telegram, WhatsApp, etc. show the project instead of a bare
// "nerds". Humans get the same HTML; React Router then renders the project.

import { fetchShareSummary, SHOW_RANK_UP_TO, truncate, type ShareSummary } from './_lib/share'

export const config = { runtime: 'edge' }

const SITE_NAME = 'nerds'

let shellPromise: Promise<string> | null = null

function loadShell(origin: string): Promise<string> {
  shellPromise ??= fetch(`${origin}/index.html`)
    .then((res) => {
      if (!res.ok) throw new Error(`index.html: ${res.status}`)
      return res.text()
    })
    .catch((err) => {
      shellPromise = null
      throw err
    })
  return shellPromise
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function headline(project: ShareSummary): string {
  const by = project.student ? ` — by ${project.student.name}` : ''
  return `${project.title}${by}`
}

function descriptionFor(project: ShareSummary): string {
  const prefix =
    project.rank <= SHOW_RANK_UP_TO ? `#${project.rank} on the nerds leaderboard. ` : ''
  return truncate(`${prefix}${project.description}`, 180)
}

function metaTags(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([key, content]) => {
      const attr = key.startsWith('og:') ? 'property' : 'name'
      return `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`
    })
    .join('\n    ')
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const origin = url.origin
  const id = url.searchParams.get('id') ?? ''

  const [shell, project] = await Promise.all([loadShell(origin), id ? fetchShareSummary(id) : null])

  const pageUrl = `${origin}/p/${encodeURIComponent(id)}`
  const title = project ? headline(project) : `${SITE_NAME} — student projects`
  const description = project
    ? descriptionFor(project)
    : 'Discover what students are building and cheer them on.'
  const version = project ? new Date(project.updatedAt).getTime() : 0
  const image = `${origin}/api/og?id=${encodeURIComponent(id)}&v=${version}`

  const tags = metaTags({
    description,
    'og:type': 'website',
    'og:site_name': SITE_NAME,
    'og:url': pageUrl,
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': project ? `Preview card for ${project.title}` : SITE_NAME,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  })

  const html = shell
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', `    <link rel="canonical" href="${escapeHtml(pageUrl)}" />\n    ${tags}\n  </head>`)

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // A miss (backend asleep) is cached briefly so the next crawl retries soon.
      'Cache-Control': project
        ? 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
        : 'public, max-age=0, s-maxage=30',
    },
  })
}
