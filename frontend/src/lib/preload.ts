import { prefetch } from './api'

// Splash stays at least this long so it doesn't flash, and never longer than the cap:
// past that, pages render their skeletons and finish loading on their own.
const MIN_SPLASH_MS = 400
const MAX_SPLASH_MS = 1800
const FADE_MS = 320

/** Start the public fetches the first screen needs, based on the URL we booted on. */
export function preloadInitialData(pathname = window.location.pathname): Promise<unknown> {
  const jobs: Promise<unknown>[] = []
  // Nearly every page reads the project list (leaderboard, profiles, admin pages).
  jobs.push(prefetch('/projects'))

  const project = pathname.match(/^\/(?:projects|p)\/([^/]+)\/?$/)
  if (project) jobs.push(prefetch(`/projects/${project[1]}`))

  const student = pathname.match(/^\/students\/([^/]+)\/?$/)
  if (student) jobs.push(prefetch(`/users/${student[1]}`))

  return Promise.allSettled(jobs)
}

/** Fade out the boot splash from index.html once data is in (or the cap is hit). */
export function hideSplashWhen(ready: Promise<unknown>) {
  const splash = document.getElementById('splash')
  if (!splash) return
  const startedAt = performance.now()
  const cap = new Promise((resolve) => setTimeout(resolve, MAX_SPLASH_MS))

  Promise.race([ready, cap]).then(() => {
    const wait = Math.max(0, MIN_SPLASH_MS - (performance.now() - startedAt))
    setTimeout(() => {
      splash.classList.add('splash--hidden')
      splash.setAttribute('aria-busy', 'false')
      setTimeout(() => splash.remove(), FADE_MS)
    }, wait)
  })
}
