import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [likesCount, setLikesCount] = useState(0)
  const [followers, setFollowers] = useState(0)
  const [following, setFollowing] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: p } = await supabase
      .from('profiles').select('*').eq('username', username).maybeSingle()
    if (!p) { setProfile(null); setLoading(false); return }
    setProfile(p)

    const { data: v } = await supabase
      .from('videos').select('*, profiles(username)')
      .eq('author_id', p.id).eq('status', 'approved')
      .order('created_at', { ascending: false })
    setVideos(v ?? [])

    const videoIds = (v ?? []).map(x => x.id)
    if (videoIds.length > 0) {
      const { count } = await supabase.from('likes')
        .select('*', { count: 'exact', head: true }).in('video_id', videoIds)
      setLikesCount(count ?? 0)
    } else setLikesCount(0)

    const { count: fers } = await supabase.from('follows')
      .select('*', { count: 'exact', head: true }).eq('following_id', p.id)
    setFollowers(fers ?? 0)

    const { count: fing } = await supabase.from('follows')
      .select('*', { count: 'exact', head: true }).eq('follower_id', p.id)
    setFollowing(fing ?? 0)

    if (user && user.id !== p.id) {
      const { data: f } = await supabase.from('follows').select('id')
        .eq('follower_id', user.id).eq('following_id', p.id).maybeSingle()
      setIsFollowing(!!f)
    } else setIsFollowing(false)

    setLoading(false)
  }

  useEffect(() => { load() }, [username, user?.id])

  async function toggleFollow() {
    if (!user) { alert('Войдите, чтобы подписаться'); return }
    setBusy(true)
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', profile.id)
    } else {
      await supabase.from('follows').insert({
        follower_id: user.id, following_id: profile.id
      })
    }
    await load()
    setBusy(false)
  }

  if (loading) return <div className="muted">Загрузка...</div>
  if (!profile) return (
    <div className="empty-state"><span className="emoji">🤷</span>Пользователь не найден.</div>
  )

  const isMe = myProfile?.id === profile.id

  return (
    <div>
      <div className="profile-banner">
        {profile.banner_url
          ? <img src={profile.banner_url} alt="banner" />
          : <div className="profile-banner-placeholder" />}
      </div>

      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" />
            : <div className="profile-avatar-placeholder">
                {profile.username?.[0]?.toUpperCase() ?? '?'}
              </div>}
        </div>

        <h1 className="profile-username">@{profile.username}</h1>

        <div className="profile-stats">
          <div className="stat-item"><div className="stat-value">{videos.length}</div><div className="stat-label">завозов</div></div>
          <div className="stat-item"><div className="stat-value">{likesCount}</div><div className="stat-label">лайков</div></div>
          <div className="stat-item"><div className="stat-value">{followers}</div><div className="stat-label">подписчиков</div></div>
          <div className="stat-item"><div className="stat-value">{following}</div><div className="stat-label">подписок</div></div>
        </div>

        <div className="profile-actions">
          {isMe ? (
            <Link to="/settings"><button className="secondary">Редактировать профиль</button></Link>
          ) : user ? (
            <button className={isFollowing ? 'secondary' : ''} onClick={toggleFollow} disabled={busy}>
              {isFollowing ? '✓ Вы подписаны' : 'Подписаться'}
            </button>
          ) : null}
        </div>
      </div>

      {profile.bio && <div className="profile-bio">{profile.bio}</div>}

      <div className="page-header" style={{ marginTop: 30 }}><h2>Завозы</h2></div>

      {videos.length === 0 ? (
        <div className="empty-state"><span className="emoji">📭</span>Пока нет завозов.</div>
      ) : (
        <div className="grid">
          {videos.map(v => (
            <VideoCard key={v.id} video={v}
              onDeleted={id => setVideos(vs => vs.filter(x => x.id !== id))} />
          ))}
        </div>
      )}
    </div>
  )
}