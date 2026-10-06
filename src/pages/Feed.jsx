import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import VideoCard from '../components/VideoCard'

export default function Feed() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('new')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('videos')
      .select('*, profiles(username)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    let list = data ?? []

    if (sort === 'top') {
      const { data: allLikes } = await supabase.from('likes').select('video_id')
      const counts = {}
      allLikes?.forEach(l => { counts[l.video_id] = (counts[l.video_id] ?? 0) + 1 })
      list = [...list].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
    }

    setVideos(list)
    setLoading(false)
  }

  useEffect(() => { load() }, [sort])

  function handleDeleted(id) {
    setVideos(v => v.filter(x => x.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <h1>🔥 Лента завозов</h1>
        <div className="spacer" />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 180 }}>
          <option value="new">Сначала новые</option>
          <option value="top">По лайкам</option>
        </select>
      </div>

      {loading ? (
        <div className="grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🎬</span>
          <h2>Пока ни одного завоза</h2>
          <p className="muted" style={{ marginTop: 8 }}>Будь первым — загрузи своё видео!</p>
        </div>
      ) : (
        <div className="grid">
          {videos.map(v => (
            <VideoCard key={v.id} video={v} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}