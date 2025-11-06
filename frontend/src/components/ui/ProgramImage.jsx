export default function ProgramImage({ src, alt, height = '200px', style = {} }) {
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZpdG5lc3M8L3RleHQ+PC9zdmc+'

  return (
    <div style={{ 
      width: '100%', 
      height: height,
      overflow: 'hidden',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      ...style
    }}>
      {src ? (
        <img 
          src={src} 
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            // Si l'image échoue, afficher le placeholder
            e.target.style.display = 'none'
            e.target.parentElement.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">💪</div>
                <div style="font-weight: bold; font-size: 1.1rem;">${alt || 'Programme Fitness'}</div>
              </div>
            `
          }}
        />
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white', 
          textAlign: 'center',
          padding: '1rem',
          width: '100%',
          height: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💪</div>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{alt || 'Programme Fitness'}</div>
        </div>
      )}
    </div>
  )
}

