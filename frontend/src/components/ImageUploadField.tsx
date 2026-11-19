import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from './Button'
import { uploadImage } from '../lib/api'
import { useAuth } from '../lib/auth'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, resizeImage } from '../lib/image'
import './ImageUploadField.css'

interface ImageUploadFieldProps {
  value: string[]
  onChange: (urls: string[]) => void
  max: number
  onBusyChange?: (busy: boolean) => void
}

export function ImageUploadField({ value, onChange, max, onBusyChange }: ImageUploadFieldProps) {
  const { token } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [urlDraft, setUrlDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const remaining = max - value.length - uploading

  useEffect(() => {
    onBusyChange?.(uploading > 0)
  }, [uploading, onBusyChange])

  function setBusy(delta: number) {
    setUploading((n) => n + delta)
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setError(null)
    if (files.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'} (max ${max}).`)
      return
    }
    const bad = files.find((f) => !ACCEPTED_IMAGE_TYPES.includes(f.type))
    if (bad) {
      setError(`"${bad.name}" isn't a JPEG, PNG or WebP image.`)
      return
    }

    const uploaded: string[] = []
    setBusy(files.length)
    for (const file of files) {
      try {
        const blob = await resizeImage(file)
        if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" is still over 5 MB after resizing.`)
        const { url } = await uploadImage(blob, token)
        uploaded.push(url)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setBusy(-1)
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded])
  }

  function addUrl() {
    const url = urlDraft.trim()
    if (!url) return
    try {
      new URL(url)
    } catch {
      setError('That doesn’t look like a valid URL.')
      return
    }
    if (value.includes(url)) {
      setError('That image is already added.')
      return
    }
    setError(null)
    onChange([...value, url])
    setUrlDraft('')
  }

  return (
    <div className="image-upload">
      <span className="image-upload__label">Screenshots ({value.length}/{max})</span>
      {(value.length > 0 || uploading > 0) && (
        <ul className="image-upload__grid">
          {value.map((url, i) => (
            <li key={url} className="image-upload__item">
              <img src={url} alt={`Screenshot ${i + 1}`} />
              <button type="button" className="image-upload__remove" aria-label={`Remove screenshot ${i + 1}`} onClick={() => onChange(value.filter((u) => u !== url))}>
                ×
              </button>
            </li>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <li key={`pending-${i}`} className="image-upload__item image-upload__item--pending">
              Uploading…
            </li>
          ))}
        </ul>
      )}
      <input ref={fileInput} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple hidden onChange={handleFiles} />
      <div className="image-upload__actions">
        <Button type="button" variant="tinted" size="small" disabled={remaining <= 0} onClick={() => fileInput.current?.click()}>
          Upload images
        </Button>
        <input
          className="image-upload__url"
          type="url"
          placeholder="…or paste an image URL"
          aria-label="Image URL"
          value={urlDraft}
          disabled={remaining <= 0}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addUrl()
            }
          }}
        />
        <Button type="button" variant="plain" size="small" disabled={remaining <= 0 || !urlDraft.trim()} onClick={addUrl}>
          Add
        </Button>
      </div>
      <p className="image-upload__hint">JPEG, PNG or WebP, up to 5 MB. Images are resized to 1600px.</p>
      {error && <p className="image-upload__error">{error}</p>}
    </div>
  )
}
