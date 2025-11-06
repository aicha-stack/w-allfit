import db from "../db/index.js";

// Posts
export const getAllPosts = async (limit = 50, offset = 0) => {
  const result = await db.query(
    `SELECT p.*, u.name as user_name, u.email as user_email,
            pr.title as program_title,
            (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.id) as reaction_count,
            (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN programs pr ON pr.id = p.program_id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

export const getPostById = async (postId) => {
  const result = await db.query(
    `SELECT p.*, u.name as user_name, u.email as user_email,
            pr.title as program_title
     FROM community_posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN programs pr ON pr.id = p.program_id
     WHERE p.id = $1`,
    [postId]
  );
  return result.rows[0] || null;
};

export const createPost = async (userId, { content, image_url, program_id }) => {
  const result = await db.query(
    `INSERT INTO community_posts (user_id, content, image_url, program_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, content, image_url, program_id]
  );
  return result.rows[0];
};

export const deletePost = async (postId, userId) => {
  const result = await db.query(
    `DELETE FROM community_posts 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [postId, userId]
  );
  if (result.rows.length === 0) throw new Error("Post not found or unauthorized");
  return { message: "Post deleted" };
};

// Reactions
export const toggleReaction = async (postId, userId, reactionType = 'like') => {
  // Check if reaction exists
  const existing = await db.query(
    `SELECT * FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );

  if (existing.rows.length > 0) {
    // Remove reaction
    await db.query(
      `DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    return { action: 'removed' };
  } else {
    // Add reaction
    await db.query(
      `INSERT INTO post_reactions (post_id, user_id, reaction_type)
       VALUES ($1, $2, $3)`,
      [postId, userId, reactionType]
    );
    return { action: 'added' };
  }
};

export const getPostReactions = async (postId) => {
  const result = await db.query(
    `SELECT pr.*, u.name as user_name
     FROM post_reactions pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.post_id = $1`,
    [postId]
  );
  return result.rows;
};

// Comments
export const getPostComments = async (postId) => {
  const result = await db.query(
    `SELECT c.*, u.name as user_name, u.email as user_email
     FROM post_comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return result.rows;
};

export const createComment = async (postId, userId, content) => {
  const result = await db.query(
    `INSERT INTO post_comments (post_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [postId, userId, content]
  );
  return result.rows[0];
};

export const deleteComment = async (commentId, userId) => {
  const result = await db.query(
    `DELETE FROM post_comments 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [commentId, userId]
  );
  if (result.rows.length === 0) throw new Error("Comment not found or unauthorized");
  return { message: "Comment deleted" };
};

// Challenges
export const getAllChallenges = async () => {
  const result = await db.query(
    `SELECT c.*, u.name as creator_name,
            (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id) as participant_count
     FROM challenges c
     JOIN users u ON u.id = c.created_by
     WHERE c.end_date >= CURRENT_DATE
     ORDER BY c.created_at DESC`
  );
  return result.rows;
};

export const createChallenge = async (userId, challengeData) => {
  const { name, description, emoji, start_date, end_date, goal_type, goal_value } = challengeData;
  const result = await db.query(
    `INSERT INTO challenges (created_by, name, description, emoji, start_date, end_date, goal_type, goal_value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, name, description, emoji, start_date, end_date, goal_type, goal_value]
  );
  return result.rows[0];
};

export const joinChallenge = async (challengeId, userId) => {
  const result = await db.query(
    `INSERT INTO challenge_participants (challenge_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (challenge_id, user_id) DO NOTHING
     RETURNING *`,
    [challengeId, userId]
  );
  return result.rows[0];
};

export const leaveChallenge = async (challengeId, userId) => {
  await db.query(
    `DELETE FROM challenge_participants 
     WHERE challenge_id = $1 AND user_id = $2`,
    [challengeId, userId]
  );
  return { message: "Left challenge" };
};

// Groups
export const getAllGroups = async () => {
  const result = await db.query(
    `SELECT g.*, u.name as creator_name,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
     FROM groups g
     JOIN users u ON u.id = g.created_by
     WHERE g.is_public = true
     ORDER BY g.created_at DESC`
  );
  return result.rows;
};

export const createGroup = async (userId, groupData) => {
  const { name, description, image_url, is_public } = groupData;
  const result = await db.query(
    `INSERT INTO groups (created_by, name, description, image_url, is_public)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, name, description, image_url, is_public !== false]
  );
  
  // Add creator as admin member
  await db.query(
    `INSERT INTO group_members (group_id, user_id, role)
     VALUES ($1, $2, 'admin')`,
    [result.rows[0].id, userId]
  );
  
  return result.rows[0];
};

export const joinGroup = async (groupId, userId) => {
  const result = await db.query(
    `INSERT INTO group_members (group_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (group_id, user_id) DO NOTHING
     RETURNING *`,
    [groupId, userId]
  );
  return result.rows[0];
};

export const leaveGroup = async (groupId, userId) => {
  await db.query(
    `DELETE FROM group_members 
     WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return { message: "Left group" };
};

