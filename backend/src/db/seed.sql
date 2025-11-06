-- Seed programs with images and detailed descriptions
-- Note: This will work even if image_url column doesn't exist yet (migration 005 will add it)
DO $$
BEGIN
  -- Check if image_url column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='programs' AND column_name='image_url'
  ) THEN
    -- Insert with image_url
    INSERT INTO programs (title, description, duration, image_url) VALUES
(
  'Cycle-Sync Strength',
  'Un programme de renforcement musculaire de 28 jours spécialement conçu pour s''aligner avec les phases de votre cycle menstruel. Ce programme adapte l''intensité et le type d''exercices selon votre phase hormonale pour optimiser vos résultats et respecter votre corps. Parfait pour les femmes qui souhaitent développer leur force tout en écoutant leur corps.',
  28,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
),
(
  'Mindful Mobility',
  'Un programme de 14 jours axé sur la mobilité quotidienne, la respiration et la récupération. Idéal pour réduire le stress, améliorer la flexibilité et créer une routine de bien-être. Ce programme combine des exercices de mobilité doux avec des techniques de respiration pour une approche holistique du fitness.',
  14,
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop'
),
(
  'Lean Starter',
  'Un programme complet de 21 jours parfait pour les débutantes. Ce programme full body vous guide étape par étape pour créer une routine de fitness cohérente. Avec des exercices progressifs et adaptés, vous développerez votre force, votre endurance et votre confiance en vous.',
  21,
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop'
),
(
  'Glu''Core',
  'Un programme intensif de 30 jours ciblant spécifiquement les muscles du tronc et des fessiers. Conçu pour renforcer votre core, améliorer votre posture et sculpter vos fessiers. Ce programme combine des exercices de renforcement ciblés avec des mouvements fonctionnels pour des résultats visibles.',
  30,
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop'
),
(
  'Fat Burn',
  'Un programme cardio de 28 jours conçu pour maximiser la combustion des graisses. Ce programme combine des séances HIIT, du cardio modéré et des exercices de renforcement pour un métabolisme optimal. Parfait pour celles qui cherchent à perdre du poids de manière efficace et durable.',
  28,
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
),
(
  'Upper Body Strength',
  'Un programme de 21 jours dédié au renforcement du haut du corps. Développez vos bras, épaules, dos et pectoraux avec des exercices progressifs adaptés aux femmes. Ce programme vous aidera à construire une force fonctionnelle et une silhouette équilibrée.',
  21,
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'
),
(
  'Lower Body Power',
  'Un programme de 30 jours ciblant les jambes et les fessiers. Renforcez vos quadriceps, ischio-jambiers, mollets et fessiers avec des exercices variés et progressifs. Ce programme est conçu pour développer la puissance du bas du corps tout en respectant votre anatomie.',
  30,
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop'
),
(
  'Total Body Burn',
  'Un programme complet de 28 jours qui travaille tout le corps. Combinez cardio et renforcement musculaire pour un entraînement équilibré. Ce programme est idéal pour celles qui cherchent un entraînement complet et efficace qui sollicite tous les groupes musculaires.',
  28,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    )
    ON CONFLICT DO NOTHING;
  ELSE
    -- Insert without image_url
    INSERT INTO programs (title, description, duration) VALUES
    (
      'Cycle-Sync Strength',
      'Un programme de renforcement musculaire de 28 jours spécialement conçu pour s''aligner avec les phases de votre cycle menstruel. Ce programme adapte l''intensité et le type d''exercices selon votre phase hormonale pour optimiser vos résultats et respecter votre corps. Parfait pour les femmes qui souhaitent développer leur force tout en écoutant leur corps.',
      28
    ),
    (
      'Mindful Mobility',
      'Un programme de 14 jours axé sur la mobilité quotidienne, la respiration et la récupération. Idéal pour réduire le stress, améliorer la flexibilité et créer une routine de bien-être. Ce programme combine des exercices de mobilité doux avec des techniques de respiration pour une approche holistique du fitness.',
      14
    ),
    (
      'Lean Starter',
      'Un programme complet de 21 jours parfait pour les débutantes. Ce programme full body vous guide étape par étape pour créer une routine de fitness cohérente. Avec des exercices progressifs et adaptés, vous développerez votre force, votre endurance et votre confiance en vous.',
      21
    ),
    (
      'Glu''Core',
      'Un programme intensif de 30 jours ciblant spécifiquement les muscles du tronc et des fessiers. Conçu pour renforcer votre core, améliorer votre posture et sculpter vos fessiers. Ce programme combine des exercices de renforcement ciblés avec des mouvements fonctionnels pour des résultats visibles.',
      30
    ),
    (
      'Fat Burn',
      'Un programme cardio de 28 jours conçu pour maximiser la combustion des graisses. Ce programme combine des séances HIIT, du cardio modéré et des exercices de renforcement pour un métabolisme optimal. Parfait pour celles qui cherchent à perdre du poids de manière efficace et durable.',
      28
    ),
    (
      'Upper Body Strength',
      'Un programme de 21 jours dédié au renforcement du haut du corps. Développez vos bras, épaules, dos et pectoraux avec des exercices progressifs adaptés aux femmes. Ce programme vous aidera à construire une force fonctionnelle et une silhouette équilibrée.',
      21
    ),
    (
      'Lower Body Power',
      'Un programme de 30 jours ciblant les jambes et les fessiers. Renforcez vos quadriceps, ischio-jambiers, mollets et fessiers avec des exercices variés et progressifs. Ce programme est conçu pour développer la puissance du bas du corps tout en respectant votre anatomie.',
      30
    ),
    (
      'Total Body Burn',
      'Un programme complet de 28 jours qui travaille tout le corps. Combinez cardio et renforcement musculaire pour un entraînement équilibré. Ce programme est idéal pour celles qui cherchent un entraînement complet et efficace qui sollicite tous les groupes musculaires.',
      28
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

