import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite,
  getFavoriteStatuses
} from "../models/favoriteModel.js";

export const toggleFavorite = async (userId, programId) => {
  const currentlyFavorite = await isFavorite(userId, programId);
  
  if (currentlyFavorite) {
    await removeFavorite(userId, programId);
    return { isFavorite: false, message: "Removed from favorites" };
  } else {
    await addFavorite(userId, programId);
    return { isFavorite: true, message: "Added to favorites" };
  }
};

export const getFavorites = async (userId) => {
  return await getUserFavorites(userId);
};

export const checkFavoriteStatus = async (userId, programId) => {
  return await isFavorite(userId, programId);
};

export const getFavoriteStatusesForPrograms = async (userId, programIds) => {
  return await getFavoriteStatuses(userId, programIds);
};

