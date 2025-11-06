import express from "express";
import {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  toggleReaction,
  getPostReactions,
  getPostComments,
  createComment,
  deleteComment,
  getAllChallenges,
  createChallenge,
  joinChallenge,
  leaveChallenge,
  getAllGroups,
  createGroup,
  joinGroup,
  leaveGroup
} from "../controllers/communityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Posts
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", createPost);
router.delete("/posts/:id", deletePost);

// Reactions
router.post("/posts/:postId/reactions", toggleReaction);
router.get("/posts/:postId/reactions", getPostReactions);

// Comments
router.get("/posts/:postId/comments", getPostComments);
router.post("/posts/:postId/comments", createComment);
router.delete("/comments/:commentId", deleteComment);

// Challenges
router.get("/challenges", getAllChallenges);
router.post("/challenges", createChallenge);
router.post("/challenges/:id/join", joinChallenge);
router.post("/challenges/:id/leave", leaveChallenge);

// Groups
router.get("/groups", getAllGroups);
router.post("/groups", createGroup);
router.post("/groups/:id/join", joinGroup);
router.post("/groups/:id/leave", leaveGroup);

export default router;

