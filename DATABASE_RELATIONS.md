# Database Relations - W.ALLfit

Ce document liste toutes les relations (foreign keys) entre les tables de la base de données.

## 📊 Schéma des Relations

### Table: `users` (Table principale)
- **Primary Key**: `id`
- **Relations sortantes**: Aucune (table racine)
- **Relations entrantes**: 
  - `enrollments.user_id` → `users.id` (CASCADE)
  - `results.user_id` → `users.id` (CASCADE)
  - `nutrition_logs.user_id` → `users.id` (CASCADE)
  - `nutrition_goals.user_id` → `users.id` (CASCADE, UNIQUE)
  - `workout_schedule.user_id` → `users.id` (CASCADE)
  - `workout_logs.user_id` → `users.id` (CASCADE)
  - `recipes.user_id` → `users.id` (SET NULL - peut être NULL pour recettes système)
  - `community_posts.user_id` → `users.id` (CASCADE)
  - `post_reactions.user_id` → `users.id` (CASCADE)
  - `post_comments.user_id` → `users.id` (CASCADE)
  - `challenges.created_by` → `users.id` (CASCADE)
  - `challenge_participants.user_id` → `users.id` (CASCADE)
  - `groups.created_by` → `users.id` (CASCADE)
  - `group_members.user_id` → `users.id` (CASCADE)

### Table: `programs` (Programmes de fitness)
- **Primary Key**: `id`
- **Relations sortantes**: Aucune
- **Relations entrantes**:
  - `enrollments.program_id` → `programs.id` (CASCADE)
  - `results.program_id` → `programs.id` (CASCADE)
  - `workout_schedule.program_id` → `programs.id` (SET NULL)
  - `community_posts.program_id` → `programs.id` (SET NULL)

### Table: `enrollments` (Inscriptions utilisateur-programme)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `enrollments.user_id` → `users.id` (CASCADE)
  - `enrollments.program_id` → `programs.id` (CASCADE)
- **Relations entrantes**:
  - `results.enrollment_id` → `enrollments.id` (SET NULL)
  - `workout_schedule.enrollment_id` → `enrollments.id` (SET NULL)
- **Contraintes**:
  - UNIQUE (user_id, program_id) - Un utilisateur ne peut s'inscrire qu'une fois par programme
  - CHECK (progress >= 0 AND progress <= 100) - Progression entre 0 et 100%

### Table: `results` (Résultats d'entraînement)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `results.user_id` → `users.id` (CASCADE)
  - `results.program_id` → `programs.id` (CASCADE)
  - `results.enrollment_id` → `enrollments.id` (SET NULL)

### Table: `nutrition_logs` (Journaux nutritionnels)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `nutrition_logs.user_id` → `users.id` (CASCADE)
- **Contraintes**:
  - UNIQUE (user_id, log_date) - Un log par utilisateur par jour
  - CHECK (calories >= 0 AND protein_g >= 0 AND carbs_g >= 0 AND fat_g >= 0)

### Table: `nutrition_goals` (Objectifs nutritionnels)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `nutrition_goals.user_id` → `users.id` (CASCADE, UNIQUE)
- **Contraintes**:
  - UNIQUE (user_id) - Un seul objectif par utilisateur
  - CHECK (protein_percent + carbs_percent + fat_percent = 100) - Les pourcentages doivent totaliser 100%

### Table: `workout_schedule` (Planning hebdomadaire)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `workout_schedule.user_id` → `users.id` (CASCADE)
  - `workout_schedule.program_id` → `programs.id` (SET NULL)
  - `workout_schedule.enrollment_id` → `enrollments.id` (SET NULL)
- **Contraintes**:
  - UNIQUE (user_id, day_of_week, scheduled_date)
  - CHECK (day_of_week >= 0 AND day_of_week <= 6)

### Table: `workout_logs` (Logs d'entraînement quotidiens)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `workout_logs.user_id` → `users.id` (CASCADE)
- **Contraintes**:
  - UNIQUE (user_id, workout_date) - Un log par utilisateur par jour

### Table: `recipes` (Recettes)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `recipes.user_id` → `users.id` (SET NULL) - Peut être NULL pour recettes système
- **Contraintes**:
  - CHECK (calories >= 0, protein_g >= 0, carbs_g >= 0, fat_g >= 0, prep_time >= 0, servings > 0)

### Table: `community_posts` (Posts communautaires)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `community_posts.user_id` → `users.id` (CASCADE)
  - `community_posts.program_id` → `programs.id` (SET NULL)
- **Relations entrantes**:
  - `post_reactions.post_id` → `community_posts.id` (CASCADE)
  - `post_comments.post_id` → `community_posts.id` (CASCADE)

### Table: `post_reactions` (Réactions aux posts)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `post_reactions.post_id` → `community_posts.id` (CASCADE)
  - `post_reactions.user_id` → `users.id` (CASCADE)
- **Contraintes**:
  - UNIQUE (post_id, user_id) - Un utilisateur ne peut réagir qu'une fois par post

### Table: `post_comments` (Commentaires sur les posts)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `post_comments.post_id` → `community_posts.id` (CASCADE)
  - `post_comments.user_id` → `users.id` (CASCADE)

### Table: `challenges` (Défis)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `challenges.created_by` → `users.id` (CASCADE)
- **Relations entrantes**:
  - `challenge_participants.challenge_id` → `challenges.id` (CASCADE)
- **Contraintes**:
  - CHECK (end_date >= start_date) - La date de fin doit être après la date de début

### Table: `challenge_participants` (Participants aux défis)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `challenge_participants.challenge_id` → `challenges.id` (CASCADE)
  - `challenge_participants.user_id` → `users.id` (CASCADE)
- **Contraintes**:
  - UNIQUE (challenge_id, user_id) - Un utilisateur ne peut participer qu'une fois par défi
  - CHECK (progress >= 0)

### Table: `groups` (Groupes)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `groups.created_by` → `users.id` (CASCADE)
- **Relations entrantes**:
  - `group_members.group_id` → `groups.id` (CASCADE)

### Table: `group_members` (Membres des groupes)
- **Primary Key**: `id`
- **Relations sortantes**:
  - `group_members.group_id` → `groups.id` (CASCADE)
  - `group_members.user_id` → `users.id` (CASCADE)
- **Contraintes**:
  - UNIQUE (group_id, user_id) - Un utilisateur ne peut être membre qu'une fois par groupe

## 🔗 Résumé des Relations par Type

### Relations CASCADE (suppression en cascade)
- Toutes les relations `user_id` vers `users` (sauf `recipes.user_id` qui est SET NULL)
- Toutes les relations vers `community_posts`, `challenges`, `groups`
- Relations `enrollments` vers `users` et `programs`

### Relations SET NULL (mise à NULL à la suppression)
- `recipes.user_id` → `users.id` (permet les recettes système)
- `workout_schedule.program_id` → `programs.id`
- `workout_schedule.enrollment_id` → `enrollments.id`
- `results.enrollment_id` → `enrollments.id`
- `community_posts.program_id` → `programs.id`

## 📈 Indexes Créés

### Indexes sur Foreign Keys
- Tous les `user_id` ont un index
- Tous les `program_id` ont un index
- Tous les `enrollment_id` ont un index
- Tous les `post_id` ont un index
- Tous les `challenge_id` ont un index
- Tous les `group_id` ont un index

### Indexes pour Performance
- `idx_nutrition_logs_date` - Recherche par date
- `idx_workout_logs_date` - Recherche par date
- `idx_workout_schedule_date` - Recherche par date
- `idx_workout_schedule_day` - Recherche par jour de la semaine
- `idx_community_posts_created` - Tri par date de création
- `idx_recipes_created` - Tri par date de création
- `idx_recipes_tags` - Recherche par tags (GIN index)

## ✅ Contraintes de Validation

1. **Progress**: Entre 0 et 100 pour `enrollments`
2. **Progress**: >= 0 pour `challenge_participants`
3. **Dates**: `end_date >= start_date` pour `challenges`
4. **Nutrition**: Toutes les valeurs >= 0
5. **Percentages**: Total = 100% pour `nutrition_goals`
6. **Recipe values**: Toutes les valeurs >= 0, servings > 0
7. **Day of week**: Entre 0 et 6 pour `workout_schedule`

## 🔄 Triggers Automatiques

- `update_recipes_updated_at` - Met à jour `updated_at` sur `recipes`
- `update_community_posts_updated_at` - Met à jour `updated_at` sur `community_posts`
- `update_post_comments_updated_at` - Met à jour `updated_at` sur `post_comments`
- `update_nutrition_goals_updated_at` - Met à jour `updated_at` sur `nutrition_goals`

## 📝 Notes Importantes

1. **Intégrité référentielle**: Toutes les relations sont protégées par des foreign keys
2. **Cascade vs SET NULL**: 
   - CASCADE pour les données critiques (suppression de l'utilisateur supprime ses données)
   - SET NULL pour les références optionnelles (programme supprimé, l'enrollment reste)
3. **Unicité**: Plusieurs tables ont des contraintes UNIQUE pour éviter les doublons
4. **Performance**: Tous les foreign keys ont des index pour optimiser les jointures

