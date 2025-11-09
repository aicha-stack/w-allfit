import { useMemo } from 'react'
import Icon from './Icon.jsx'

export default function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: 'var(--border)' }

    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }

    if (checks.length) score++
    if (checks.lowercase) score++
    if (checks.uppercase) score++
    if (checks.number) score++
    if (checks.special) score++

    const levels = [
      { level: 0, label: 'Très faible', color: '#ef4444' },
      { level: 1, label: 'Faible', color: '#f97316' },
      { level: 2, label: 'Moyen', color: '#eab308' },
      { level: 3, label: 'Fort', color: '#22c55e' },
      { level: 4, label: 'Très fort', color: '#10b981' }
    ]

    const levelIndex = Math.min(Math.floor(score / 1.2), 4)
    return levels[levelIndex]
  }, [password])

  if (!password) return null

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.875rem'
      }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
          Force du mot de passe:
        </span>
        <span style={{ 
          color: strength.color, 
          fontWeight: '600',
          fontSize: '0.8rem'
        }}>
          {strength.label}
        </span>
      </div>
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        height: '4px',
        borderRadius: '2px',
        overflow: 'hidden',
        background: 'var(--border)'
      }}>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              flex: 1,
              height: '100%',
              background: level <= strength.level ? strength.color : 'transparent',
              transition: 'background 0.3s ease',
              borderRadius: '2px'
            }}
          />
        ))}
      </div>
      <div style={{
        marginTop: '0.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <span style={{ 
          color: password.length >= 8 ? 'var(--success)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {password.length >= 8 ? <Icon name="check" size={14} color="var(--success)" /> : <Icon name="circle" size={14} color="var(--text-secondary)" />} 8+ caractères
        </span>
        <span style={{ 
          color: /[a-z]/.test(password) && /[A-Z]/.test(password) ? 'var(--success)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? <Icon name="check" size={14} color="var(--success)" /> : <Icon name="circle" size={14} color="var(--text-secondary)" />} Majuscules & minuscules
        </span>
        <span style={{ 
          color: /[0-9]/.test(password) ? 'var(--success)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {/[0-9]/.test(password) ? <Icon name="check" size={14} color="var(--success)" /> : <Icon name="circle" size={14} color="var(--text-secondary)" />} Chiffres
        </span>
        <span style={{ 
          color: /[^A-Za-z0-9]/.test(password) ? 'var(--success)' : 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          {/[^A-Za-z0-9]/.test(password) ? <Icon name="check" size={14} color="var(--success)" /> : <Icon name="circle" size={14} color="var(--text-secondary)" />} Caractères spéciaux
        </span>
      </div>
    </div>
  )
}

