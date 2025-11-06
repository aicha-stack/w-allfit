import db from "../db/index.js";

// Get all recipes (user's + system)
export const getAllRecipes = async (userId = null) => {
  try {
    // First check if recipes table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recipes'
      )
    `);
    
    if (!tableCheck.rows[0]?.exists) {
      console.warn('Recipes table does not exist yet');
      return [];
    }
    
    // Get system recipes (user_id IS NULL) + user's recipes (user_id = userId)
    // If userId is null, get all recipes
    let query, params;
    if (userId === null) {
      query = `SELECT r.*, u.name as author_name
               FROM recipes r
               LEFT JOIN users u ON u.id = r.user_id
               ORDER BY r.created_at DESC`;
      params = [];
    } else {
      query = `SELECT r.*, u.name as author_name
               FROM recipes r
               LEFT JOIN users u ON u.id = r.user_id
               WHERE r.user_id IS NULL OR r.user_id = $1
               ORDER BY r.created_at DESC`;
      params = [userId];
    }
    const result = await db.query(query, params);
    return result.rows || [];
  } catch (err) {
    console.error('Error in getAllRecipes:', err);
    console.error('Error details:', err.message, err.stack);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

// Get recipe by ID
export const getRecipeById = async (id) => {
  const result = await db.query(
    `SELECT r.*, u.name as author_name
     FROM recipes r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// Create recipe
export const createRecipe = async (userId, recipeData) => {
  const {
    title,
    description,
    image_url,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    prep_time,
    servings,
    ingredients,
    instructions,
    tags
  } = recipeData;

  const result = await db.query(
    `INSERT INTO recipes 
     (user_id, title, description, image_url, calories, protein_g, carbs_g, fat_g, prep_time, servings, ingredients, instructions, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [userId, title, description, image_url, calories, protein_g, carbs_g, fat_g, prep_time, servings, ingredients, instructions, tags]
  );
  return result.rows[0];
};

// Update recipe
export const updateRecipe = async (id, userId, recipeData) => {
  const {
    title,
    description,
    image_url,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    prep_time,
    servings,
    ingredients,
    instructions,
    tags
  } = recipeData;

  const result = await db.query(
    `UPDATE recipes 
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         image_url = COALESCE($3, image_url),
         calories = COALESCE($4, calories),
         protein_g = COALESCE($5, protein_g),
         carbs_g = COALESCE($6, carbs_g),
         fat_g = COALESCE($7, fat_g),
         prep_time = COALESCE($8, prep_time),
         servings = COALESCE($9, servings),
         ingredients = COALESCE($10, ingredients),
         instructions = COALESCE($11, instructions),
         tags = COALESCE($12, tags),
         updated_at = NOW()
     WHERE id = $13 AND (user_id = $14 OR user_id IS NULL)
     RETURNING *`,
    [title, description, image_url, calories, protein_g, carbs_g, fat_g, prep_time, servings, ingredients, instructions, tags, id, userId]
  );
  if (result.rows.length === 0) throw new Error("Recipe not found or unauthorized");
  return result.rows[0];
};

// Delete recipe
export const deleteRecipe = async (id, userId) => {
  // Convert userId to integer to ensure proper comparison
  const userIdInt = parseInt(userId, 10);
  const recipeIdInt = parseInt(id, 10);
  
  if (isNaN(userIdInt)) {
    throw new Error("Invalid user ID");
  }
  
  if (isNaN(recipeIdInt)) {
    throw new Error("Invalid recipe ID");
  }
  
  // First check if recipe exists and belongs to user
  const checkResult = await db.query(
    `SELECT id, user_id FROM recipes WHERE id = $1`,
    [recipeIdInt]
  );
  
  if (checkResult.rows.length === 0) {
    throw new Error("Recipe not found");
  }
  
  const recipe = checkResult.rows[0];
  
  // Only allow deletion if recipe belongs to user (not system recipes)
  if (recipe.user_id === null || recipe.user_id === undefined) {
    throw new Error("Cannot delete system recipes");
  }
  
  // Compare as integers to avoid type mismatch
  const recipeUserIdInt = parseInt(recipe.user_id, 10);
  if (recipeUserIdInt !== userIdInt) {
    throw new Error("You can only delete your own recipes");
  }
  
  // Delete the recipe
  const result = await db.query(
    `DELETE FROM recipes 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [recipeIdInt, userIdInt]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Failed to delete recipe");
  }
  
  return { message: "Recipe deleted successfully" };
};

