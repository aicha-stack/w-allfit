import {
  toggleFavorite,
  getFavorites,
  checkFavoriteStatus,
  getFavoriteStatusesForPrograms
} from "../services/favoriteService.js";

export const toggleFavoriteController = async (req, res) => {
  try {
    const { programId } = req.params;
    const result = await toggleFavorite(req.user.id, parseInt(programId, 10));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFavoritesController = async (req, res) => {
  try {
    const favorites = await getFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkFavoriteStatusController = async (req, res) => {
  try {
    const { programId } = req.params;
    const isFav = await checkFavoriteStatus(req.user.id, parseInt(programId, 10));
    res.json({ isFavorite: isFav });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFavoriteStatusesController = async (req, res) => {
  try {
    const { programIds } = req.query;
    if (!programIds) {
      return res.status(400).json({ error: "programIds query parameter is required" });
    }
    
    const ids = Array.isArray(programIds) 
      ? programIds.map(id => parseInt(id, 10))
      : programIds.split(',').map(id => parseInt(id, 10));
    
    const statuses = await getFavoriteStatusesForPrograms(req.user.id, ids);
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

