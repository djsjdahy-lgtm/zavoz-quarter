import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { uploadImage } from '../lib/upload'

export default function Settings() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? '')
      setAvatarUrl(profile.avatar_url ?? '')
      setBannerUrl(profile.banner_url ?? '')
    }
  }, [profile])

  async function onAvatar(e) {
    const file = e.target.files?.[0]; if (!file) return
    setError('')
    try { setBusy(true); setAvatarUrl(await uploadImage('avatars', user.id, file)) }
    catch (err) { setError(err.message) }
    setBusy(false)
  }

  async function onBanner(e) {
    const file = e.target.files?.[0]; if (!file) return
    setError('')
    try { setBusy(true); setBannerUrl(await uploadImage('banners', user.id, file)) }
    catch (err) { setError(err.message) }
    setBusy(false)
  }

  async function save(e) {
    e.preventDefault(); setError(''); setMsg(''); setBusy(true)
    const { error } = await supabase.from('profiles')
      .update({ bio: bio.trim(), avatar_url: avatarUrl, banner_url: bannerUrl })
      .eq('id', user.id)
    setBusy(false)
    if (error) { setError(error.message); return }
    setMsg('Сохранено!')
    setTimeout(() => nav(`/u/${profile.username}`), 700)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header"><h1>⚙️ Настройки профиля</h1></div>
      <div className="card">
        <form onSubmit={save}>
          <label className="muted">Баннер (до 3 МБ)</label>
          {bannerUrl && <div className="profile-banner" style={{ height: 120 }}><img src={bannerUrl} alt="banner" /></div>}
          <input type="file" accept="image/*" onChange={onBanner} />

          <label className="muted">Аватарка (до 3 МБ)</label>
          {avatarUrl && <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />}
          <input type="file" accept="image/*" onChange={onAvatar} />

          <label className="muted">Описание</label>
          <textarea rows={4} maxLength={300} placeholder="Пара слов о себе..." value={bio} onChange={e => setBio(e.target.value)} />

          {error && <div className="error">{error}</div>}
          {msg && <div style={{ color: 'var(--success)' }}>{msg}</div>}
          <button type="submit" disabled={busy}>{busy ? 'Сохранение...' : 'Сохранить'}</button>
        </form>
      </div>
    </div>
  )
}