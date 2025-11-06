import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Navbar() {
  const { token, user, setToken, setUser } = useAuth()
  const navigate = useNavigate()

  const logout = () => {
    setToken('')
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/programs" className="brand">W.ALLfit</Link>
        <Link to="/about">About</Link>
        <Link to="/programs">Programs</Link>
        {token && <Link to="/dashboard">Dashboard</Link>}
        {token && <Link to="/profile">Profile</Link>}
        {token && user?.role === 'admin' && <Link to="/admin/programs">Admin</Link>}
      </div>
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </>
        ) : (
          <button className="btn" onClick={logout}>Logout</button>
        )}
      </div>
    </nav>
  )
}


