import * as recipeModel from "../models/recipeModel.js";

export const getAllRecipes = async (userId) => {
  return await recipeModel.getAllRecipes(userId);
};

export const getRecipeById = async (id) => {
  const recipe = await recipeModel.getRecipeById(id);
  if (!recipe) throw new Error("Recipe not found");
  return recipe;
};

export const createRecipe = async (userId, recipeData) => {
  if (!recipeData.title) throw new Error("Title is required");
  return await recipeModel.createRecipe(userId, recipeData);
};

export const updateRecipe = async (id, userId, recipeData) => {
  return await recipeModel.updateRecipe(id, userId, recipeData);
};

export const deleteRecipe = async (id, userId) => {
  return await recipeModel.deleteRecipe(id, userId);
};

