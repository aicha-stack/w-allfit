import * as recipeService from "../services/recipeService.js";

export const getAllRecipes = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    console.log('Getting recipes for user:', userId);
    const recipes = await recipeService.getAllRecipes(userId);
    console.log(`Found ${recipes.length} recipes`);
    res.json(recipes || []);
  } catch (err) {
    console.error('Error getting recipes:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to load recipes' });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await recipeService.getRecipeById(req.params.id);
    res.json(recipe);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.createRecipe(req.user.id, req.body);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const recipe = await recipeService.updateRecipe(req.params.id, req.user.id, req.body);
    res.json(recipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    await recipeService.deleteRecipe(req.params.id, req.user.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

