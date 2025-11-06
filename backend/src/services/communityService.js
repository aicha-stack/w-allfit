import * as communityModel from "../models/communityModel.js";

export const getAllPosts = async (limit, offset) => {
  return await communityModel.getAllPosts(limit || 50, offset || 0);
};

export const getPostById = async (postId) => {
  const post = await communityModel.getPostById(postId);
  if (!post) throw new Error("Post not found");
  return post;
};

export const createPost = async (userId, postData) => {
  if (!postData.content) throw new Error("Content is required");
  return await communityModel.createPost(userId, postData);
};

export const deletePost = async (postId, userId) => {
  return await communityModel.deletePost(postId, userId);
};

export const toggleReaction = async (postId, userId, reactionType) => {
  return await communityModel.toggleReaction(postId, userId, reactionType);
};

export const getPostReactions = async (postId) => {
  return await communityModel.getPostReactions(postId);
};

export const getPostComments = async (postId) => {
  return await communityModel.getPostComments(postId);
};

export const createComment = async (postId, userId, content) => {
  if (!content) throw new Error("Comment content is required");
  return await communityModel.createComment(postId, userId, content);
};

export const deleteComment = async (commentId, userId) => {
  return await communityModel.deleteComment(commentId, userId);
};

export const getAllChallenges = async () => {
  return await communityModel.getAllChallenges();
};

export const createChallenge = async (userId, challengeData) => {
  if (!challengeData.name) throw new Error("Challenge name is required");
  return await communityModel.createChallenge(userId, challengeData);
};

export const joinChallenge = async (challengeId, userId) => {
  return await communityModel.joinChallenge(challengeId, userId);
};

export const leaveChallenge = async (challengeId, userId) => {
  return await communityModel.leaveChallenge(challengeId, userId);
};

export const getAllGroups = async () => {
  return await communityModel.getAllGroups();
};

export const createGroup = async (userId, groupData) => {
  if (!groupData.name) throw new Error("Group name is required");
  return await communityModel.createGroup(userId, groupData);
};

export const joinGroup = async (groupId, userId) => {
  return await communityModel.joinGroup(groupId, userId);
};

export const leaveGroup = async (groupId, userId) => {
  return await communityModel.leaveGroup(groupId, userId);
};

