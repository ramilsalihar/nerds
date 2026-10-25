import { useState } from 'react'
import { Card, Switch } from '../components'
import { useAuth } from '../lib/auth'
import { colorFor, initials } from '../lib/color'
import './Settings.css'

const NOTIFICATIONS_KEY = 'nerds.settings.notifications'

function loadNotificationPrefs() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    return raw ? (JSON.parse(raw) as { newComments: boolean; newLikes: boolean; weeklyDigest: boolean }) : null
  } catch {
    return null
  }
}

export function Settings() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(
    () => loadNotificationPrefs() ?? { newComments: true, newLikes: false, weeklyDigest: true },
  )

  function update(key: keyof typeof prefs, value: boolean) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next))
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Settings</h1>

      <Card>
        <h2 className="settings__section-title">Account</h2>
        {user && (
          <div className="settings__account">
            <div className="settings__avatar" style={{ background: colorFor(user.id) }}>
              {initials(user.name)}
            </div>
            <div>
              <p className="settings__account-name">{user.name}</p>
              <p className="settings__account-email">{user.email}</p>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="settings__section-title">Notifications</h2>
        <p className="settings__hint">Stored on this device only — not wired to email yet.</p>
        <div className="settings__row">
          <div>
            <p className="settings__row-title">New comments</p>
            <p className="settings__row-subtitle">Notify when a viewer comments on a project</p>
          </div>
          <Switch checked={prefs.newComments} onChange={(v) => update('newComments', v)} label="New comments" />
        </div>
        <div className="settings__row">
          <div>
            <p className="settings__row-title">New likes</p>
            <p className="settings__row-subtitle">Notify when a project gets liked</p>
          </div>
          <Switch checked={prefs.newLikes} onChange={(v) => update('newLikes', v)} label="New likes" />
        </div>
        <div className="settings__row">
          <div>
            <p className="settings__row-title">Weekly digest</p>
            <p className="settings__row-subtitle">Leaderboard movement summary, once a week</p>
          </div>
          <Switch checked={prefs.weeklyDigest} onChange={(v) => update('weeklyDigest', v)} label="Weekly digest" />
        </div>
      </Card>
    </div>
  )
}
