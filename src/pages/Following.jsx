import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'

export default function Following() {
  const { user, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const { data: follows } = await supabase.from('follows')
        .select('following_id').eq('follower_id', user.id)
      const ids = (follows ?? []).map(f => f.following_id)
      if (ids.length === 0) { setVideos([]); setLoading(false); return }

      const { data } = await supabase.from('videos')
        .select('*, profiles(username)').in('author_id', ids)
        .eq('status', 'approved').order('created_at', { ascending: false })
      setVideos(data ?? []); setLoading(false)
    }
    load()
  }, [user])

  if (authLoading) return <div className="muted">Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div>
      <div className="page-header"><h1>👥 Моя лента</h1></div>
      {loading ? <div className="muted">Загрузка...</div>
        : videos.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">🔍</span>
            <h2>Тут пока пусто</h2>
            <p className="muted" style={{ marginTop: 8 }}>Подпишись на кого-нибудь, чтобы видеть их завозы здесь.</p>
          </div>
        ) : (
          <div className="grid">
            {videos.map(v => <VideoCard key={v.id} video={v}
              onDeleted={id => setVideos(vs => vs.filter(x => x.id !== id))} />)}
          </div>
        )}
    </div>
  )
}