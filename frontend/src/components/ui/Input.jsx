import { useState, useEffect, useRef } from 'react'

export default function Input({ 
  label, 
  error, 
  helperText,
  icon,
  showPasswordToggle = false,
  validation,
  onValidationChange,
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationState, setValidationState] = useState(null) // null | 'valid' | 'invalid'
  const [validationMessage, setValidationMessage] = useState('')
  const inputRef = useRef(null)
  const hasValue = props.value && props.value.toString().length > 0

  // Validation en temps réel
  useEffect(() => {
    if (validation && props.value) {
      try {
        const result = validation(props.value)
        if (result === null || result === undefined) {
          setValidationState(null)
          setValidationMessage('')
          return
        }
        if (typeof result === 'object' && result !== null) {
          setValidationState(result.valid ? 'valid' : 'invalid')
          setValidationMessage(result.message || '')
          if (onValidationChange) {
            onValidationChange(result.valid)
          }
        } else if (typeof result === 'boolean') {
          setValidationState(result ? 'valid' : 'invalid')
          setValidationMessage('')
          if (onValidationChange) {
            onValidationChange(result)
          }
        } else {
          setValidationState(null)
          setValidationMessage('')
        }
      } catch (err) {
        console.error('Validation error:', err)
        setValidationState(null)
        setValidationMessage('')
      }
    } else {
      setValidationState(null)
      setValidationMessage('')
    }
  }, [props.value, validation, onValidationChange])

  const inputType = showPasswordToggle && props.type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : props.type || 'text'

  const hasError = error || validationState === 'invalid'
  const isValid = validationState === 'valid' && !error

  return (
    <div style={{ 
      marginBottom: '1.25rem',
      position: 'relative'
    }}>
      {/* Label avec animation */}
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        color: hasError ? '#ef4444' : (isValid ? 'var(--success)' : 'var(--fg)'),
        transition: 'color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
        <span>{label}</span>
        {props.required && (
          <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
        )}
      </label>

      {/* Input Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Input Field */}
        <input
          ref={inputRef}
          {...props}
          type={inputType}
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            paddingRight: showPasswordToggle ? '3rem' : (isValid || hasError ? '2.5rem' : '1rem'),
            border: `1.5px solid ${hasError ? '#ef4444' : (isValid ? 'var(--success)' : (isFocused ? 'var(--brand)' : 'var(--border)'))}`,
            borderRadius: '12px',
            background: isFocused ? 'var(--card-soft)' : 'var(--card)',
            color: 'var(--fg)',
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            boxShadow: isFocused 
              ? (hasError 
                  ? '0 0 0 4px rgba(239, 68, 68, 0.1)' 
                  : (isValid 
                      ? '0 0 0 4px rgba(125, 211, 160, 0.1)' 
                      : '0 0 0 4px rgba(168, 85, 247, 0.15)'))
              : 'none',
            minHeight: '44px',
            ...props.style
          }}
          onFocus={(e) => {
            setIsFocused(true)
            if (props.onFocus) props.onFocus(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            if (props.onBlur) props.onBlur(e)
          }}
          className={`input-field ${hasError ? 'input-error' : ''} ${isValid ? 'input-valid' : ''}`}
        />

        {/* Status Icons */}
        {isValid && !showPasswordToggle && (
          <div style={{
            position: 'absolute',
            right: '1rem',
            pointerEvents: 'none',
            color: 'var(--success)',
            fontSize: '1.1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            ✓
          </div>
        )}

        {hasError && !showPasswordToggle && (
          <div style={{
            position: 'absolute',
            right: '1rem',
            pointerEvents: 'none',
            color: '#ef4444',
            fontSize: '1.1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            ✕
          </div>
        )}

        {/* Password Toggle */}
        {showPasswordToggle && props.type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              minWidth: '36px',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--brand-light)'
              e.target.style.color = 'var(--brand)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = 'var(--text-secondary)'
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>⚠️</span>
          <span>{error || validationMessage || 'Ce champ contient une erreur'}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          {helperText}
        </div>
      )}

      {/* Success Message */}
      {isValid && validationMessage && (
        <div style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--success)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <span>✓</span>
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  )
}
