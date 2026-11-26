import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './ImageGallery.css'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

/** Uncropped thumbnail strip; clicking a thumbnail opens a full-size lightbox. */
export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [open, setOpen] = useState<number | null>(null)
  const count = images.length

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, step])

  if (count === 0) return null

  return (
    <>
      <div className={className}>
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className="image-gallery__thumb"
            onClick={() => setOpen(i)}
            aria-label={`Open ${alt} ${i + 1} of ${count}`}
          >
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={close}>
            <img
              className="lightbox__img"
              src={images[open]}
              alt={`${alt} ${open + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" className="lightbox__btn lightbox__close" onClick={close} aria-label="Close">
              ✕
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox__btn lightbox__prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    step(-1)
                  }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox__btn lightbox__next"
                  onClick={(e) => {
                    e.stopPropagation()
                    step(1)
                  }}
                  aria-label="Next image"
                >
                  ›
                </button>
                <span className="lightbox__count">
                  {open + 1} / {count}
                </span>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
