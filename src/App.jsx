import { Routes, Route, NavLink, Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Feed from './pages/Feed'
import Login from './pages/Login'
import AddVideo from './pages/AddVideo'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import TagPage from './pages/TagPage'
import Following from './pages/Following'

function Nav() {
  const { user, profile, signOut } = useAuth()
  return (
    <nav className="topbar">
      <span className="brand">🎒 Завоз Четверти</span>
      <div className="tabs">
        <NavLink to="/" end className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Лента</NavLink>
        {user && <NavLink to="/following" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Подписки</NavLink>}
        {user && <NavLink to="/add" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Добавить</NavLink>}
        {profile?.is_admin && <NavLink to="/admin" className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}>Админ</NavLink>}
      </div>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={`/u/${profile?.username}`} className="user-chip" style={{ textDecoration: 'none' }}>
            <span className="dot" />{profile?.username ?? '...'}
          </Link>
          <button className="ghost" onClick={signOut}>Выйти</button>
        </div>
      ) : (
        <NavLink to="/login" className="tab">Войти</NavLink>
      )}
    </nav>
  )
}

export default function App() {
  const { loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container"><div className="muted">Загрузка...</div></div>

  return (
    <>
      <Nav />
      <div className="container" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/following" element={<Protected><Following /></Protected>} />
          <Route path="/add" element={<Protected><AddVideo /></Protected>} />
          <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  )
}

function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminOnly({ children }) {
  const { user, profile } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!profile?.is_admin) return <div className="empty-state"><span className="emoji">🔒</span>Доступ только для админа.</div>
  return children
}