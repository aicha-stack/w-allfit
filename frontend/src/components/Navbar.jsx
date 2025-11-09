import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { token, user, setToken, setUser } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const logout = () => {
    setToken('')
    setUser(null)
    navigate('/login')
    setIsOpen(false)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.nav') && !e.target.closest('.mobile-menu')) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/programs" className="brand">W.ALLfit</Link>
          
          {/* Desktop links */}
          <div style={{ display: 'none', gap: '1rem', alignItems: 'center' }} className="desktop-links">
            <Link to="/about">About</Link>
            <Link to="/programs">Programs</Link>
            {token && <Link to="/dashboard">Dashboard</Link>}
            {token && <Link to="/profile">Profile</Link>}
            {token && user?.role === 'admin' && <Link to="/admin/programs">Admin</Link>}
          </div>
        </div>

        {/* Desktop right side */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-right">
          {!token ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          ) : (
            <button className="btn" onClick={logout}>Logout</button>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="mobile-menu-button"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-content">
            <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/programs" onClick={() => setIsOpen(false)}>Programs</Link>
            {token && <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>}
            {token && <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>}
            {token && user?.role === 'admin' && (
              <Link to="/admin/programs" onClick={() => setIsOpen(false)}>Admin</Link>
            )}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'block',
                      marginTop: '1rem',
                      textAlign: 'center',
                      background: 'var(--gradient-purple)',
                      color: 'white',
                      padding: '0.875rem',
                      borderRadius: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    background: 'var(--gradient-purple)',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-links,
          .desktop-right {
            display: flex !important;
          }
          .mobile-menu-button {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-links,
          .desktop-right {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}


