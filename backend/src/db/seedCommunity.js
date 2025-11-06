import db from "./index.js";

export async function ensureCommunityData() {
  try {
    // Get admin user for creating posts
    const adminResult = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminResult.rows.length === 0) {
      console.log("⚠ No admin user found, skipping community seed");
      return;
    }
    const adminId = adminResult.rows[0].id;

    // Get a program for posts
    const programResult = await db.query("SELECT id, title FROM programs LIMIT 1");
    const programId = programResult.rows.length > 0 ? programResult.rows[0].id : null;
    const programTitle = programResult.rows.length > 0 ? programResult.rows[0].title : null;

    // Seed Community Posts
    const posts = [
      {
        content: "Just completed my first week of Cycle-Sync Strength! Feeling amazing and so proud of my progress! 💪✨ The program is really helping me understand my body better.",
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        program_id: programId
      },
      {
        content: "The Mindful Mobility program has been a game changer for my recovery days. Highly recommend to anyone looking for a gentle yet effective routine! 🧘‍♀️",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
        program_id: programId
      },
      {
        content: "Reached 50% progress on Glu'Core! The results are already visible and I'm feeling stronger every day! 🎉 Can't wait to see what the next 50% brings!",
        image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop",
        program_id: programId
      },
      {
        content: "Started the Fat Burn program this week and I'm already feeling more energetic! The HIIT sessions are challenging but so rewarding! 🔥",
        image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
        program_id: programId
      },
      {
        content: "Love how W.ALLfit adapts to my cycle! This is exactly what I needed - a fitness app that understands women's bodies! 💗",
        image_url: null,
        program_id: null
      }
    ];

    // Check existing posts
    const existingPosts = await db.query("SELECT COUNT(*) FROM community_posts");
    const postCount = parseInt(existingPosts.rows[0].count);

    if (postCount < posts.length) {
      let added = 0;
      for (const post of posts) {
        try {
          await db.query(
            `INSERT INTO community_posts (user_id, content, image_url, program_id)
             VALUES ($1, $2, $3, $4)`,
            [adminId, post.content, post.image_url, post.program_id]
          );
          added++;
        } catch (err) {
          console.error(`✗ Error creating post:`, err.message);
        }
      }
      if (added > 0) {
        console.log(`✓ Added ${added} community posts`);
      }
    } else {
      console.log(`✓ Community posts already exist`);
    }

    // Seed Challenges
    const challenges = [
      {
        name: "30-Day Strength Challenge",
        description: "Build strength together over 30 days! Complete daily workouts and track your progress with the community.",
        emoji: "💪",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal_type: "workouts",
        goal_value: 30
      },
      {
        name: "Weekly Cardio Goals",
        description: "Complete 3 cardio sessions this week! Let's get our heart rates up together!",
        emoji: "🏃",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal_type: "workouts",
        goal_value: 3
      },
      {
        name: "Mindful Movement",
        description: "Daily mobility and mindfulness practice. Take care of your body and mind every day!",
        emoji: "🧘",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal_type: "days",
        goal_value: 14
      },
      {
        name: "Nutrition Focus",
        description: "Track your nutrition daily for 7 days! Build healthy habits together!",
        emoji: "🥗",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal_type: "days",
        goal_value: 7
      }
    ];

    const existingChallenges = await db.query("SELECT COUNT(*) FROM challenges");
    const challengeCount = parseInt(existingChallenges.rows[0].count);

    if (challengeCount < challenges.length) {
      let added = 0;
      for (const challenge of challenges) {
        try {
          const existing = await db.query(
            "SELECT id FROM challenges WHERE name = $1",
            [challenge.name]
          );
          if (existing.rows.length === 0) {
            await db.query(
              `INSERT INTO challenges (created_by, name, description, emoji, start_date, end_date, goal_type, goal_value)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                adminId,
                challenge.name,
                challenge.description,
                challenge.emoji,
                challenge.start_date,
                challenge.end_date,
                challenge.goal_type,
                challenge.goal_value
              ]
            );
            added++;
          }
        } catch (err) {
          console.error(`✗ Error creating challenge ${challenge.name}:`, err.message);
        }
      }
      if (added > 0) {
        console.log(`✓ Added ${added} challenges`);
      }
    } else {
      console.log(`✓ Challenges already exist`);
    }

    // Seed Groups
    const groups = [
      {
        name: "Beginner's Circle",
        description: "A supportive community for women just starting their fitness journey. Share tips, ask questions, and celebrate every milestone together!",
        image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
        is_public: true
      },
      {
        name: "Cycle-Sync Enthusiasts",
        description: "For women following cycle-synced training! Share experiences, track your cycle phases, and support each other through hormonal changes.",
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        is_public: true
      },
      {
        name: "Nutrition & Wellness",
        description: "Share healthy recipes, nutrition tips, and wellness practices. Let's nourish our bodies together!",
        image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
        is_public: true
      },
      {
        name: "Strength Builders",
        description: "For women focused on building strength and muscle! Share progress, form tips, and celebrate PRs!",
        image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
        is_public: true
      },
      {
        name: "Yoga & Mobility",
        description: "A space for yoga practitioners and mobility enthusiasts. Share flows, stretches, and mindfulness practices.",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
        is_public: true
      }
    ];

    const existingGroups = await db.query("SELECT COUNT(*) FROM groups");
    const groupCount = parseInt(existingGroups.rows[0].count);

    if (groupCount < groups.length) {
      let added = 0;
      for (const group of groups) {
        try {
          const existing = await db.query(
            "SELECT id FROM groups WHERE name = $1",
            [group.name]
          );
          if (existing.rows.length === 0) {
            const result = await db.query(
              `INSERT INTO groups (created_by, name, description, image_url, is_public)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id`,
              [
                adminId,
                group.name,
                group.description,
                group.image_url,
                group.is_public
              ]
            );
            const groupId = result.rows[0].id;
            
            // Add admin as group member
            await db.query(
              `INSERT INTO group_members (group_id, user_id, role)
               VALUES ($1, $2, 'admin')
               ON CONFLICT DO NOTHING`,
              [groupId, adminId]
            );
            added++;
          }
        } catch (err) {
          console.error(`✗ Error creating group ${group.name}:`, err.message);
        }
      }
      if (added > 0) {
        console.log(`✓ Added ${added} groups`);
      }
    } else {
      console.log(`✓ Groups already exist`);
    }

  } catch (err) {
    console.error("✗ Error seeding community data:", err.message);
  }
}

