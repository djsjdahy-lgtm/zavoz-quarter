import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseVideo } from '../lib/parseVideo'
import { useAuth } from '../context/AuthContext'

export default function VideoCard({ video, onDeleted }) {
  const { user, profile } = useAuth()
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [bump, setBump] = useState(false)
  const embed = parseVideo(video.video_url)

  async function loadLikes() {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', video.id)
    setLikes(count ?? 0)

    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('video_id', video.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(!!data)
    }
  }

  useEffect(() => { loadLikes() }, [video.id, user?.id])

  async function toggleLike() {
    if (!user) { alert('Войдите, чтобы лайкать'); return }
    setBusy(true)
    setBump(true)
    setTimeout(() => setBump(false), 400)

    if (liked) {
      await supabase.from('likes').delete().eq('video_id', video.id).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ video_id: video.id, user_id: user.id })
    }
    await loadLikes()
    setBusy(false)
  }

  async function deleteVideo() {
    if (!confirm('Удалить видео?')) return
    const { error } = await supabase.from('videos').delete().eq('id', video.id)
    if (!error && onDeleted) onDeleted(video.id)
  }

  const canDelete = profile?.is_admin || user?.id === video.author_id

  return (
    <div className="video-card">
      <div className="video-embed">
        {embed?.embed ? (
          <iframe
            src={embed.embed}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <a href={video.video_url} target="_blank" rel="noreferrer" className="fallback-link">
            ▶ Открыть видео по ссылке
          </a>
        )}
      </div>

      <div className="video-title">{video.title}</div>
      <div className="video-meta">
        {video.profiles?.username ?? '—'} · {new Date(video.created_at).toLocaleDateString('ru')}
      </div>

      <div className="like-row">
        <button
          className={`like-btn ${liked ? 'liked' : ''} ${bump ? 'bump' : ''}`}
          onClick={toggleLike}
          disabled={busy}
        >
          {liked ? '❤️' : '🤍'} {likes}
        </button>
        {canDelete && (
          <button className="ghost" onClick={deleteVideo} style={{ marginLeft: 'auto' }}>
            🗑
          </button>
        )}
      </div>
    </div>
  )
}