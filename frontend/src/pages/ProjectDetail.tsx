import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, ImageGallery, ProjectDetailSkeleton, ShareButton, ShareCard, Textarea } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { relativeTime } from '../lib/format'
import { getViewerToken, hasLiked, setLiked } from '../lib/viewer'
import { PROJECT_TYPE_LABEL } from '../lib/types'
import type { Comment, Project } from '../lib/types'
import './ProjectDetail.css'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLikedState] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)

  function loadProject() {
    if (!id) return
    api<Project>(`/projects/${id}`)
      .then(setProject)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(loadProject, [id])
  useEffect(() => {
    if (id) setLikedState(hasLiked(id))
  }, [id])

  async function toggleLike() {
    if (!id || !project) return
    setLikeBusy(true)
    try {
      const result = await api<{ liked: boolean; likeCount: number }>(`/projects/${id}/like`, {
        method: 'POST',
        body: { viewerToken: getViewerToken() },
      })
      setLiked(id, result.liked)
      setLikedState(result.liked)
      setProject({ ...project, likeCount: result.likeCount })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLikeBusy(false)
    }
  }

  if (error) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-red-strong)' }}>Couldn't load this project: {error}</p>
      </Card>
    )
  }

  if (!project) {
    return <ProjectDetailSkeleton />
  }

  const isOwner = !!user && user.id === project.studentId

  return (
    <div className="project-detail">
      <div className="project-detail__main">
        <Card>
          <div className="project-detail__header">
            {project.rank && <span className="project-detail__rank">#{project.rank} on the leaderboard</span>}
            <span className={`project-detail__type project-detail__type--${project.type}`}>{PROJECT_TYPE_LABEL[project.type]}</span>
            {project.deployed && <span className="project-detail__badge">Deployed</span>}
            <span className="project-detail__meta">Added {relativeTime(project.createdAt)}</span>
          </div>
          <h1 className="project-detail__title">{project.title}</h1>
          {project.student && (
            <p className="project-detail__client">
              by <Link to={`/students/${project.student.id}`}>{project.student.name}</Link>
            </p>
          )}
          <p className="project-detail__description">{project.description}</p>
          <div className="project-detail__links">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="project-detail__link">
                GitHub ↗
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="project-detail__link">
                Live demo ↗
              </a>
            )}
            {project.videoUrl && (
              <a href={project.videoUrl} target="_blank" rel="noreferrer" className="project-detail__link">
                Demo video ↗
              </a>
            )}
          </div>
          <ImageGallery className="project-detail__images" images={project.imageUrls} alt={`${project.title} screenshot`} />
        </Card>

        <Card>
          <h2 className="project-detail__section-title">Metrics</h2>
          <div className="project-detail__metrics">
            <Metric label="Score" value={project.score} />
            <Metric label="Users" value={project.usersCount} />
            <Metric label="Revenue" value={`$${Number(project.revenueAmount).toLocaleString()}`} />
            <Metric label="Likes" value={project.likeCount} />
          </div>
        </Card>

        <Card>
          <h2 className="project-detail__section-title">Comments</h2>
          <CommentForm projectId={project.id} onPosted={loadProject} />
          <CommentList comments={project.comments ?? []} />
        </Card>
      </div>

      <div className="project-detail__side">
        <Card>
          <Button variant={liked ? 'tinted' : 'filled'} style={{ width: '100%' }} disabled={likeBusy} onClick={toggleLike}>
            {liked ? '♥ Liked' : '♡ Like this project'}
          </Button>
          <p className="project-detail__meta" style={{ marginTop: 8, textAlign: 'center' }}>
            {project.likeCount} {project.likeCount === 1 ? 'like' : 'likes'}
          </p>
          {!isOwner && (
            <div style={{ marginTop: 12 }}>
              <ShareButton project={project} fullWidth />
            </div>
          )}
        </Card>
        {isOwner && (
          <Card>
            <ShareCard project={project} />
          </Card>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="project-detail__metric">
      <span className="project-detail__metric-value">{value}</span>
      <span className="project-detail__metric-label">{label}</span>
    </div>
  )
}

function CommentForm({ projectId, onPosted }: { projectId: string; onPosted: () => void }) {
  const { user, token } = useAuth()
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await api(`/projects/${projectId}/comments`, { method: 'POST', token, body: { body } })
      setBody('')
      onPosted()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <p style={{ color: 'var(--label-secondary)' }}>
        <Link to="/login">Log in</Link> to leave a comment.
      </p>
    )
  }

  return (
    <div className="project-detail__comment-form">
      <p className="project-detail__meta">Commenting as {user.name}</p>
      <Textarea id="comment-body" label="Comment" required rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
      {error && <p className="project-detail__error">{error}</p>}
      <Button variant="filled" disabled={submitting || !body} onClick={submit}>
        {submitting ? 'Posting…' : 'Post comment'}
      </Button>
    </div>
  )
}

function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p style={{ color: 'var(--label-secondary)', marginTop: 16 }}>No comments yet — be the first.</p>
  }

  return (
    <div className="project-detail__comments">
      {comments.map((c) => (
        <div key={c.id} className="project-detail__comment">
          <div className="project-detail__comment-header">
            <strong>{c.authorName}</strong>
            <span className="project-detail__meta">{relativeTime(c.createdAt)}</span>
          </div>
          <p className="project-detail__comment-body">{c.body}</p>
        </div>
      ))}
    </div>
  )
}
