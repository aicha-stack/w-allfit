import db from "./index.js";

const recipes = [
  {
    title: "Green Smoothie Bowl",
    description: "Un smoothie bowl énergisant et riche en nutriments, parfait pour le petit-déjeuner ou une collation post-entraînement.",
    image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop",
    calories: 280,
    protein_g: 8,
    carbs_g: 45,
    fat_g: 10,
    prep_time: 10,
    servings: 1,
    ingredients: [
      "1 banane congelée",
      "1 poignée d'épinards frais",
      "1/2 avocat",
      "1 cuillère à soupe de graines de chia",
      "150ml de lait d'amande",
      "1 cuillère à soupe de miel",
      "Garniture: fruits rouges, noix de coco râpée, graines"
    ],
    instructions: "1. Mixer tous les ingrédients jusqu'à obtenir une texture lisse et crémeuse\n2. Verser dans un bol\n3. Garnir avec les fruits rouges, la noix de coco et les graines\n4. Déguster immédiatement",
    tags: ["breakfast", "vegan", "healthy", "quick"]
  },
  {
    title: "Quinoa Power Salad",
    description: "Salade complète et équilibrée riche en protéines végétales, idéale pour un déjeuner nutritif.",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    calories: 350,
    protein_g: 15,
    carbs_g: 50,
    fat_g: 12,
    prep_time: 20,
    servings: 2,
    ingredients: [
      "100g de quinoa cuit",
      "1/2 concombre coupé en dés",
      "1 tomate cerise coupée en deux",
      "50g de feta",
      "1/4 d'avocat",
      "1 cuillère à soupe d'huile d'olive",
      "Jus de citron",
      "Herbes fraîches (basilic, coriandre)"
    ],
    instructions: "1. Cuire le quinoa selon les instructions\n2. Laisser refroidir\n3. Mélanger le quinoa avec les légumes\n4. Ajouter la feta et l'avocat\n5. Assaisonner avec l'huile d'olive et le citron\n6. Parsemer d'herbes fraîches",
    tags: ["lunch", "vegetarian", "protein", "salad"]
  },
  {
    title: "Grilled Chicken & Veggies",
    description: "Un plat équilibré riche en protéines, parfait après un entraînement de renforcement musculaire.",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
    calories: 420,
    protein_g: 45,
    carbs_g: 30,
    fat_g: 12,
    prep_time: 25,
    servings: 1,
    ingredients: [
      "150g de filet de poulet",
      "200g de légumes mélangés (courgette, poivron, brocoli)",
      "100g de patate douce",
      "1 cuillère à soupe d'huile d'olive",
      "Épices (paprika, ail, herbes de Provence)",
      "Sel et poivre"
    ],
    instructions: "1. Préchauffer le four à 200°C\n2. Couper la patate douce en cubes et faire rôtir 15 min\n3. Assaisonner le poulet et le faire griller 6-7 min de chaque côté\n4. Faire sauter les légumes dans une poêle\n5. Servir le tout ensemble",
    tags: ["dinner", "protein", "post-workout", "balanced"]
  },
  {
    title: "Protein Pancakes",
    description: "Pancakes protéinés et délicieux, parfaits pour un petit-déjeuner rassasiant avant l'entraînement.",
    image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
    calories: 320,
    protein_g: 25,
    carbs_g: 35,
    fat_g: 8,
    prep_time: 15,
    servings: 2,
    ingredients: [
      "2 œufs",
      "1 banane écrasée",
      "30g de protéine en poudre (vanille)",
      "2 cuillères à soupe de flocons d'avoine",
      "1/2 cuillère à café de levure",
      "1 cuillère à soupe de miel",
      "Fruits frais pour garnir"
    ],
    instructions: "1. Mélanger tous les ingrédients dans un bol\n2. Laisser reposer 5 minutes\n3. Faire cuire les pancakes dans une poêle anti-adhésive\n4. Servir avec des fruits frais et un filet de miel",
    tags: ["breakfast", "protein", "sweet", "pre-workout"]
  },
  {
    title: "Salmon & Sweet Potato Bowl",
    description: "Bowl nutritif avec saumon riche en oméga-3 et patate douce, idéal pour la récupération.",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
    calories: 480,
    protein_g: 35,
    carbs_g: 45,
    fat_g: 18,
    prep_time: 30,
    servings: 1,
    ingredients: [
      "150g de saumon",
      "200g de patate douce",
      "100g de brocoli",
      "50g de quinoa",
      "1/2 avocat",
      "1 cuillère à soupe d'huile d'olive",
      "Jus de citron"
    ],
    instructions: "1. Cuire la patate douce au four (25 min)\n2. Cuire le quinoa\n3. Faire cuire le saumon à la poêle (6-7 min)\n4. Cuire le brocoli à la vapeur\n5. Assembler dans un bol avec l'avocat\n6. Arroser d'huile d'olive et de citron",
    tags: ["dinner", "omega3", "recovery", "balanced"]
  },
  {
    title: "Overnight Oats",
    description: "Oats préparés la veille, riches en fibres et protéines, prêts à déguster le matin.",
    image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&h=600&fit=crop",
    calories: 290,
    protein_g: 12,
    carbs_g: 50,
    fat_g: 8,
    prep_time: 5,
    servings: 1,
    ingredients: [
      "50g de flocons d'avoine",
      "150ml de lait d'amande",
      "1 cuillère à soupe de protéine en poudre",
      "1 cuillère à soupe de graines de chia",
      "1/2 banane",
      "Baies fraîches",
      "1 cuillère à café de miel"
    ],
    instructions: "1. Mélanger les flocons d'avoine, le lait et la protéine\n2. Ajouter les graines de chia\n3. Laisser au réfrigérateur toute la nuit\n4. Le matin, ajouter la banane, les baies et le miel\n5. Déguster froid",
    tags: ["breakfast", "meal-prep", "fiber", "quick"]
  }
];

export async function ensureRecipes() {
  try {
    // Check if recipes already exist
    const existing = await db.query("SELECT COUNT(*) FROM recipes WHERE user_id IS NULL");
    const count = parseInt(existing.rows[0].count);

    if (count >= recipes.length) {
      console.log(`✓ ${count} system recipes already exist, skipping seed`);
      return;
    }

    let added = 0;
    for (const recipe of recipes) {
      try {
        // Check if recipe exists by title
        const existingRecipe = await db.query(
          "SELECT id FROM recipes WHERE title = $1 AND user_id IS NULL",
          [recipe.title]
        );

        if (existingRecipe.rows.length === 0) {
          await db.query(
            `INSERT INTO recipes (user_id, title, description, image_url, calories, protein_g, carbs_g, fat_g, prep_time, servings, ingredients, instructions, tags)
             VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              recipe.title,
              recipe.description,
              recipe.image_url,
              recipe.calories,
              recipe.protein_g,
              recipe.carbs_g,
              recipe.fat_g,
              recipe.prep_time,
              recipe.servings,
              recipe.ingredients,
              recipe.instructions,
              recipe.tags
            ]
          );
          added++;
          console.log(`✓ Added recipe: ${recipe.title}`);
        }
      } catch (err) {
        console.error(`✗ Error with recipe ${recipe.title}:`, err.message);
      }
    }

    if (added > 0) {
      console.log(`✓ Successfully added ${added} recipes`);
    } else {
      console.log(`✓ All recipes are up to date`);
    }
  } catch (err) {
    console.error("✗ Error seeding recipes:", err.message);
  }
}

