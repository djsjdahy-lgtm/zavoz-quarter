import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('videos')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
    setVideos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function setStatus(id, status) {
    await supabase.from('videos').update({ status }).eq('id', id)
    load()
  }

  async function remove(id) {
    if (!confirm('Удалить видео навсегда?')) return
    await supabase.from('videos').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'all' ? videos : videos.filter(v => v.status === filter)

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Админ-панель</h1>
        <div className="spacer" />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 180 }}>
          <option value="all">Все ({videos.length})</option>
          <option value="approved">Одобренные</option>
          <option value="pending">На модерации</option>
          <option value="rejected">Отклонённые</option>
        </select>
      </div>

      {loading ? (
        <div className="muted">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">📭</span>
          Ничего нет в этой категории.
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Автор</th>
              <th>Статус</th>
              <th style={{ textAlign:'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id}>
                <td>
                  <a href={v.video_url} target="_blank" rel="noreferrer">{v.title}</a>
                </td>
                <td>{v.profiles?.username ?? '—'}</td>
                <td>
                  <span className={`badge ${v.status}`}>{v.status}</span>
                </td>
                <td style={{ textAlign:'right' }}>
                  <div style={{ display:'inline-flex', gap: 6 }}>
                    {v.status !== 'approved' && (
                      <button className="secondary" onClick={() => setStatus(v.id, 'approved')}>✓</button>
                    )}
                    {v.status !== 'rejected' && (
                      <button className="secondary" onClick={() => setStatus(v.id, 'rejected')}>✕</button>
                    )}
                    <button className="danger" onClick={() => remove(v.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}