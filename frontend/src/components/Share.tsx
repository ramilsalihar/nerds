import { useEffect, useRef, useState } from 'react'
import type { Project } from '../lib/types'
import {
  canNativeShare,
  copyText,
  ogImageUrl,
  ownerCaptions,
  platformShareUrl,
  SHARE_PLATFORMS,
  shareUrl,
  viewerCaption,
} from '../lib/share'
import { Button } from './Button'
import './Share.css'

type ShareProject = Pick<Project, 'id' | 'title' | 'updatedAt' | 'rank' | 'student'>

function PlatformLinks({ url, text }: { url: string; text: string }) {
  return (
    <div className="share__platforms">
      {SHARE_PLATFORMS.map((p) => (
        <a
          key={p.id}
          className={`share__platform share__platform--${p.id}`}
          href={platformShareUrl(p.id, url, text)}
          target="_blank"
          rel="noreferrer"
        >
          {p.label}
        </a>
      ))}
    </div>
  )
}

function useCopied(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])
  return [copied, async (text) => setCopied(await copyText(text))]
}

// Share button for anyone viewing a project: native share sheet on phones,
// a small menu (copy link + platforms) elsewhere.
export function ShareButton({ project, size = 'regular', fullWidth = false }: { project: ShareProject; size?: 'regular' | 'small'; fullWidth?: boolean }) {
  const [open, setOpen] = useState(false)
  const [copied, copy] = useCopied()
  const ref = useRef<HTMLDivElement>(null)
  const url = shareUrl(project.id)
  const text = viewerCaption(project)

  useEffect(() => {
    if (!open) return
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function onClick() {
    if (canNativeShare()) {
      try {
        await navigator.share({ title: project.title, text, url })
      } catch {
        // User dismissed the sheet.
      }
      return
    }
    setOpen((v) => !v)
  }

  return (
    <div className={`share__anchor ${fullWidth ? 'share__anchor--full' : ''}`} ref={ref}>
      <Button variant="tinted" size={size} style={fullWidth ? { width: '100%' } : undefined} onClick={onClick} aria-expanded={open}>
        ↗ Share
      </Button>
      {open && (
        <div className="share__menu" role="menu">
          <button type="button" className="share__copy" onClick={() => copy(url)}>
            {copied ? '✓ Link copied' : 'Copy link'}
          </button>
          <PlatformLinks url={url} text={text} />
        </div>
      )}
    </div>
  )
}

// Owner-facing card: shows the exact preview others will see, suggests a
// caption, and makes posting one click.
export function ShareCard({ project, heading = 'Share your project' }: { project: ShareProject; heading?: string }) {
  const captions = ownerCaptions(project)
  const [captionIndex, setCaptionIndex] = useState(0)
  const [previewOk, setPreviewOk] = useState(true)
  const [linkCopied, copyLink] = useCopied()
  const [postCopied, copyPost] = useCopied()
  const url = shareUrl(project.id)
  const caption = captions[captionIndex] ?? captions[0]
  const image = ogImageUrl(project)

  async function share() {
    if (canNativeShare()) {
      try {
        await navigator.share({ title: project.title, text: caption, url })
      } catch {
        // dismissed
      }
      return
    }
    await copyPost(`${caption} ${url}`)
  }

  return (
    <div className="share-card">
      <div className="share-card__header">
        <h2 className="share-card__title">{heading}</h2>
        <p className="share-card__subtitle">Every like from a share helps you climb the leaderboard.</p>
      </div>

      {previewOk && (
        <img
          className="share-card__preview"
          src={image}
          alt="Preview of how your link looks when shared"
          onError={() => setPreviewOk(false)}
        />
      )}

      <div className="share-card__link">
        <span className="share-card__url">{url.replace(/^https?:\/\//, '')}</span>
        <Button variant="plain" size="small" onClick={() => copyLink(url)}>
          {linkCopied ? '✓ Copied' : 'Copy'}
        </Button>
      </div>

      <fieldset className="share-card__captions">
        <legend className="share-card__label">Pick a caption</legend>
        {captions.map((c, i) => (
          <label key={c} className={`share-card__caption ${i === captionIndex ? 'share-card__caption--active' : ''}`}>
            <input type="radio" name={`caption-${project.id}`} checked={i === captionIndex} onChange={() => setCaptionIndex(i)} />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>

      <Button variant="filled" style={{ width: '100%' }} onClick={share}>
        {postCopied ? '✓ Caption + link copied' : canNativeShare() ? 'Share' : 'Copy caption + link'}
      </Button>

      <PlatformLinks url={url} text={caption} />

      {previewOk && (
        <a className="share-card__download" href={image} download={`${project.title}.png`}>
          Download image for Instagram or Stories
        </a>
      )}
    </div>
  )
}
