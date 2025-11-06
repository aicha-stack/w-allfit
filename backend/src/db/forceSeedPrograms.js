import db from "./index.js";

const programs = [
  {
    title: 'Cycle-Sync Strength',
    description: 'Un programme de renforcement musculaire de 28 jours spécialement conçu pour s\'aligner avec les phases de votre cycle menstruel. Ce programme adapte l\'intensité et le type d\'exercices selon votre phase hormonale pour optimiser vos résultats et respecter votre corps. Parfait pour les femmes qui souhaitent développer leur force tout en écoutant leur corps.',
    duration: 28,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
  },
  {
    title: 'Mindful Mobility',
    description: 'Un programme de 14 jours axé sur la mobilité quotidienne, la respiration et la récupération. Idéal pour réduire le stress, améliorer la flexibilité et créer une routine de bien-être. Ce programme combine des exercices de mobilité doux avec des techniques de respiration pour une approche holistique du fitness.',
    duration: 14,
    image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop'
  },
  {
    title: 'Lean Starter',
    description: 'Un programme complet de 21 jours parfait pour les débutantes. Ce programme full body vous guide étape par étape pour créer une routine de fitness cohérente. Avec des exercices progressifs et adaptés, vous développerez votre force, votre endurance et votre confiance en vous.',
    duration: 21,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop'
  },
  {
    title: 'Glu\'Core',
    description: 'Un programme intensif de 30 jours ciblant spécifiquement les muscles du tronc et des fessiers. Conçu pour renforcer votre core, améliorer votre posture et sculpter vos fessiers. Ce programme combine des exercices de renforcement ciblés avec des mouvements fonctionnels pour des résultats visibles.',
    duration: 30,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop'
  },
  {
    title: 'Fat Burn',
    description: 'Un programme cardio de 28 jours conçu pour maximiser la combustion des graisses. Ce programme combine des séances HIIT, du cardio modéré et des exercices de renforcement pour un métabolisme optimal. Parfait pour celles qui cherchent à perdre du poids de manière efficace et durable.',
    duration: 28,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop'
  },
  {
    title: 'Upper Body Strength',
    description: 'Un programme de 21 jours dédié au renforcement du haut du corps. Développez vos bras, épaules, dos et pectoraux avec des exercices progressifs adaptés aux femmes. Ce programme vous aidera à construire une force fonctionnelle et une silhouette équilibrée.',
    duration: 21,
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'
  },
  {
    title: 'Lower Body Power',
    description: 'Un programme de 30 jours ciblant les jambes et les fessiers. Renforcez vos quadriceps, ischio-jambiers, mollets et fessiers avec des exercices variés et progressifs. Ce programme est conçu pour développer la puissance du bas du corps tout en respectant votre anatomie.',
    duration: 30,
    image_url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop'
  },
  {
    title: 'Total Body Burn',
    description: 'Un programme complet de 28 jours qui travaille tout le corps. Combinez cardio et renforcement musculaire pour un entraînement équilibré. Ce programme est idéal pour celles qui cherchent un entraînement complet et efficace qui sollicite tous les groupes musculaires.',
    duration: 28,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
  }
];

async function forceSeedPrograms() {
  try {
    // Check if image_url column exists
    let hasImageUrl = false;
    try {
      const checkResult = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='programs' AND column_name='image_url'
      `);
      hasImageUrl = checkResult.rows.length > 0;
    } catch (err) {
      console.log("Could not check for image_url column");
    }

    let added = 0;
    let updated = 0;
    
    for (const program of programs) {
      try {
        // Check if program exists
        const existing = await db.query("SELECT id FROM programs WHERE title = $1", [program.title]);
        
        if (existing.rows.length > 0) {
          // Update existing program
          if (hasImageUrl) {
            await db.query(
              `UPDATE programs 
               SET description = $1, duration = $2, image_url = $3 
               WHERE title = $4`,
              [program.description, program.duration, program.image_url, program.title]
            );
          } else {
            await db.query(
              `UPDATE programs 
               SET description = $1, duration = $2 
               WHERE title = $4`,
              [program.description, program.duration, program.title]
            );
          }
          updated++;
          console.log(`✓ Updated: ${program.title}`);
        } else {
          // Insert new program
          if (hasImageUrl) {
            await db.query(
              `INSERT INTO programs (title, description, duration, image_url) 
               VALUES ($1, $2, $3, $4)`,
              [program.title, program.description, program.duration, program.image_url]
            );
          } else {
            await db.query(
              `INSERT INTO programs (title, description, duration) 
               VALUES ($1, $2, $3)`,
              [program.title, program.description, program.duration]
            );
          }
          added++;
          console.log(`✓ Added: ${program.title}`);
        }
      } catch (err) {
        console.error(`✗ Error with program ${program.title}:`, err.message);
      }
    }

    console.log(`\n✓ Successfully added ${added} programs and updated ${updated} programs`);
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err.message);
    process.exit(1);
  }
}

forceSeedPrograms();

