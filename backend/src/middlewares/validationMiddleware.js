// Validation middleware for request inputs

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Email invalide');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email requis');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Mot de passe requis');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

export const validateProgram = (req, res, next) => {
  const { title, description, duration, image_url } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }

  if (description && typeof description !== 'string' && description.length > 1000) {
    errors.push('La description ne peut pas dépasser 1000 caractères');
  }

  if (duration !== undefined && duration !== null) {
    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 365) {
      errors.push('La durée doit être un nombre entre 1 et 365 jours');
    }
  }

  if (image_url && typeof image_url !== 'string') {
    errors.push('URL d\'image invalide');
  }

  if (image_url && image_url.length > 500) {
    errors.push('URL d\'image trop longue (max 500 caractères)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !email.includes('@')) {
      errors.push('Email invalide');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

export const validateProgress = (req, res, next) => {
  const { progress } = req.body;
  
  if (progress === undefined || progress === null) {
    return res.status(400).json({ error: 'Progress est requis' });
  }

  const progressNum = Number(progress);
  if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
    return res.status(400).json({ error: 'Progress doit être un nombre entre 0 et 100' });
  }

  next();
};

export const validateProgramId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID de programme invalide' });
  }

  req.params.id = id;
  next();
};

