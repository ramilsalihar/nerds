import { createServer } from 'vite'
import assert from 'node:assert/strict'
import React from 'react'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ root: fileURLToPath(new URL('../', import.meta.url)), server: { middlewareMode: true } })
try {
  const { ProjectCard } = await server.ssrLoadModule('/src/components/ProjectCard.tsx')
  const project = { id: 'demo', title: 'Demo', imageUrls: ['https://example.com/first.png', 'https://example.com/second.png'], createdAt: new Date().toISOString(), type: 'startup' }
  const render = (images) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ProjectCard, { project: { ...project, imageUrls: images } })))
  assert.match(render(project.imageUrls), /<img[^>]+src="https:\/\/example.com\/first.png"/)
  assert.doesNotMatch(render(project.imageUrls), /<img[^>]+src="https:\/\/example.com\/second.png"/)
  assert.match(render(project.imageUrls.slice(1)), /<img[^>]+src="https:\/\/example.com\/second.png"/)
  assert.doesNotMatch(render([]), /<img/)
  assert.match(render([]), />D<\/div>/)
  const { ProjectForm } = await server.ssrLoadModule('/src/components/ProjectForm.tsx')
  const { AuthProvider } = await server.ssrLoadModule('/src/lib/auth.tsx')
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => null }, configurable: true })
  const form = (images) => renderToStaticMarkup(React.createElement(AuthProvider, null,
    React.createElement(ProjectForm, { students: [], project: { ...project, imageUrls: images } })))
  assert.match(form([]), /The first image you upload will be/)
  assert.equal((form(project.imageUrls).match(/>Preview image</g) ?? []).length, 1)
  assert.match(form(project.imageUrls), /first.png[^]*?>Preview image</)
  delete globalThis.localStorage
  console.log('PASS: first image preview, next image after removal, and no-image fallback')
} finally {
  await server.close()
}
