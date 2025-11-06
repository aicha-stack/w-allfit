// Global error handler middleware

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ error: 'Cette ressource existe déjà' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Référence invalide' });
  }

  if (err.code === '23502') { // Not null violation
    return res.status(400).json({ error: 'Champ requis manquant' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expiré' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur';

  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
};

