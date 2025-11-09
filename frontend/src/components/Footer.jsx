import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from './ui/Icon.jsx'

export default function Footer() {
  const { token, user } = useAuth()
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    // Récupérer le compteur de visiteurs depuis localStorage
    const storedCount = localStorage.getItem('w-allfit-visitor-count')
    let count = storedCount ? parseInt(storedCount, 10) : 0
    
    // Vérifier si c'est une nouvelle visite (pas de sessionStorage)
    const hasVisitedToday = sessionStorage.getItem('w-allfit-visited-today')
    
    if (!hasVisitedToday) {
      // Nouvelle visite
      count += 1
      localStorage.setItem('w-allfit-visitor-count', count.toString())
      sessionStorage.setItem('w-allfit-visited-today', 'true')
    }
    
    setVisitorCount(count)
  }, [])

  const quickLinks = [
    { path: '/programs', label: 'Programs', iconName: 'fitness' },
    { path: '/about', label: 'About', iconName: 'info' },
    ...(token ? [
      { path: '/dashboard', label: 'Dashboard', iconName: 'dashboard' },
      { path: '/profile', label: 'Profile', iconName: 'user' }
    ] : [
      { path: '/login', label: 'Login', iconName: 'lock' },
      { path: '/register', label: 'Register', iconName: 'star' }
    ])
  ]

  return (
    <footer style={{
      marginTop: '4rem',
      padding: '3rem 1.5rem 2rem',
      borderTop: '1px solid var(--border)',
      background: 'var(--card)',
      borderRadius: '24px 24px 0 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'var(--gradient-purple)'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}>
        {/* Brand Section */}
        <div>
          <h3 style={{
            marginBottom: '1rem',
            fontSize: '1.3rem',
            fontWeight: '800',
            background: 'var(--gradient-purple)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.3px'
          }}>
            W.ALLfit
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            marginBottom: '1rem'
          }}>
            Votre compagnon fitness pour atteindre vos objectifs. Entraînez-vous, suivez votre progression et rejoignez une communauté motivée.
          </p>
          {/* Visitor Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'var(--card-soft)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            marginTop: '1rem'
          }}>
            <Icon name="users" size={20} color="var(--brand)" />
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.25rem'
              }}>
                Visiteurs
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'var(--brand)',
                fontFamily: 'monospace'
              }}>
                {visitorCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'var(--fg)'
          }}>
            Liens Rapides
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  padding: '0.5rem 0',
                  transition: 'all 0.2s ease',
                  borderRadius: '8px',
                  paddingLeft: '0.5rem',
                  marginLeft: '-0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--brand)'
                  e.target.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-secondary)'
                  e.target.style.transform = 'translateX(0)'
                }}
              >
                <Icon name={link.iconName} size={18} color="currentColor" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact/Info Section */}
        <div>
          <h4 style={{
            marginBottom: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: 'var(--fg)'
          }}>
            Informations
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="email" size={18} color="var(--text-secondary)" />
              <span>support@w-allfit.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="globe" size={18} color="var(--text-secondary)" />
              <span>www.w-allfit.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="heart" size={18} color="var(--brand)" />
              <span>Fait avec passion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'var(--text-tertiary)',
        fontSize: '0.875rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span>© {new Date().getFullYear()} W.ALLfit</span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span>Tous droits réservés</span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer {
            padding: 2rem 1rem 1.5rem !important;
            margin-top: 3rem !important;
          }
          
          footer > div:first-of-type {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </footer>
  )
}

