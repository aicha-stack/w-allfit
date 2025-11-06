import * as communityService from "../services/communityService.js";

// Posts
export const getAllPosts = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const posts = await communityService.getAllPosts(parseInt(limit), parseInt(offset));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await communityService.getPostById(req.params.id);
    res.json(post);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const post = await communityService.createPost(req.user.id, req.body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await communityService.deletePost(req.params.id, req.user.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Reactions
export const toggleReaction = async (req, res) => {
  try {
    const result = await communityService.toggleReaction(
      req.params.postId,
      req.user.id,
      req.body.reaction_type || 'like'
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPostReactions = async (req, res) => {
  try {
    const reactions = await communityService.getPostReactions(req.params.postId);
    res.json(reactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Comments
export const getPostComments = async (req, res) => {
  try {
    const comments = await communityService.getPostComments(req.params.postId);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const comment = await communityService.createComment(
      req.params.postId,
      req.user.id,
      req.body.content
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await communityService.deleteComment(req.params.commentId, req.user.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Challenges
export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await communityService.getAllChallenges();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createChallenge = async (req, res) => {
  try {
    const challenge = await communityService.createChallenge(req.user.id, req.body);
    res.status(201).json(challenge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinChallenge = async (req, res) => {
  try {
    const result = await communityService.joinChallenge(req.params.id, req.user.id);
    res.json(result || { message: "Already joined" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const leaveChallenge = async (req, res) => {
  try {
    await communityService.leaveChallenge(req.params.id, req.user.id);
    res.json({ message: "Left challenge successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await communityService.getAllGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createGroup = async (req, res) => {
  try {
    const group = await communityService.createGroup(req.user.id, req.body);
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const result = await communityService.joinGroup(req.params.id, req.user.id);
    res.json(result || { message: "Already joined" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    await communityService.leaveGroup(req.params.id, req.user.id);
    res.json({ message: "Left group successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

