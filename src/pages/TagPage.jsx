import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import VideoCard from '../components/VideoCard'

export default function TagPage() {
  const { tag } = useParams()
  const nav = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('videos')
        .select('*, profiles(username)').eq('status', 'approved')
        .contains('tags', [tag]).order('created_at', { ascending: false })
      setVideos(data ?? []); setLoading(false)
    }
    load()
  }, [tag])

  return (
    <div>
      <div className="page-header">
        <button className="ghost" onClick={() => nav(-1)}>← Назад</button>
        <h1>#{tag}</h1>
        <span className="muted">({videos.length})</span>
      </div>
      {loading ? <div className="muted">Загрузка...</div>
        : videos.length === 0 ? (
          <div className="empty-state"><span className="emoji">🏷</span>По тегу #{tag} пока ничего нет.</div>
        ) : (
          <div className="grid">
            {videos.map(v => <VideoCard key={v.id} video={v}
              onDeleted={id => setVideos(vs => vs.filter(x => x.id !== id))} />)}
          </div>
        )}
    </div>
  )
}