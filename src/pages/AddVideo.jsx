import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { parseVideo } from '../lib/parseVideo'
import { useAuth } from '../context/AuthContext'

export default function AddVideo() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!title.trim() || !url.trim()) { setError('Заполни оба поля'); return }
    const parsed = parseVideo(url)
    if (!parsed) { setError('Некорректная ссылка'); return }

    setBusy(true)
    const { error } = await supabase.from('videos').insert({
      author_id: user.id,
      title: title.trim(),
      video_url: url.trim(),
      platform: parsed.platform,
      status: 'approved',
    })
    setBusy(false)
    if (error) { setError(error.message); return }
    nav('/')
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header">
        <h1>📹 Добавить завоз</h1>
      </div>

      <div className="card">
        <p className="muted" style={{ marginBottom: 16 }}>
          Вставь ссылку на видео из TikTok, YouTube, VK Видео или Rutube.
        </p>
        <form onSubmit={submit}>
          <input
            placeholder="Название (например: Завоз с физры)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
          <input
            placeholder="https://www.tiktok.com/@user/video/123..."
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={busy}>
            {busy ? 'Отправка...' : 'Опубликовать'}
          </button>
        </form>
      </div>
    </div>
  )
}