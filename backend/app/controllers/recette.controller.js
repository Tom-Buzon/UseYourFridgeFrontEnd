const db = require("../models");
const Recette = db.recette;
const { Pool } = require('pg');

const pool = new Pool({
  user: "useyourfridgeAdm",
  host: "useyourfridgedb.cz8kwm66811r.eu-west-3.rds.amazonaws.com",
  database: "useyourfridgeDB",
  password: "Admin!123",
  port: "5432",
});


exports.getTitre = async (req, res) => {
  Recette.findAll({ attributes : ['title']})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving recettes."
      });
    });
};



exports.getTitreAndIngredients = async (req, res) => {
  Recette.findAll({include: [{model:db.recette_ingredients}]})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving recettes."
      });
    });
};

exports.getRecipesTitles = async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM recettes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the titres' });
  }
};

exports.getMatchingsRecipes = async (req, res) => {
  const { ingredients } = req.body;
  try {
    const query = `
      SELECT * FROM recettes
      WHERE $1::text[] @> string_to_array(ingredients, ', ')::text[]
    `;
    const result = await pool.query(query, [ingredients]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des recettes correspondantes', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM recettes WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Recette non trouvée' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de la recette' });
  }
};


exports.getAllTagsByLang = async (req, res) => {
  const { tag } = req.params;
  const lang = req.query.lang || 'fr'; // Langue par défaut : français

  if (!['fr', 'en'].includes(lang)) {
    return res.status(400).json({ error: 'Langue non supportée.' });
  }

  let tagColumn;
  if (tag === 'tag1') tagColumn = lang === 'en' ? 'tag1_en' : 'tag1';
  else if (tag === 'tag2') tagColumn = lang === 'en' ? 'tag2_en' : 'tag2';
  else if (tag === 'tag3') tagColumn = lang === 'en' ? 'tag3_en' : 'tag3';
  else return res.status(400).json({ error: 'Tag invalide.' });

  try {
    const result = await pool.query(`SELECT DISTINCT ${tagColumn} FROM recetteformat WHERE ${tagColumn} IS NOT NULL`);
    const tagOptions = result.rows.map(row => row[tagColumn]);
    res.json(tagOptions);
  } catch (err) {
    console.error(`Erreur lors de la récupération des tags (${tag}):`, err);
    res.status(500).json({ error: `Une erreur est survenue lors de la récupération des tags (${tag})` });
  }
};

exports.getAllRecipesFormat = async (req, res) => {
  const lang = req.query.lang || 'fr'; // Langue par défaut : français

  if (!['fr', 'en'].includes(lang)) {
    return res.status(400).json({ error: 'Langue non supportée.' });
  }

  try {
    const query = `
  SELECT 
    rf.id, 
    ${lang === 'en' ? 'rf.title_en AS title' : 'rf.title'}, 
    rf.url, 
    rf.rate, 
    ${lang === 'en' ? 'rf.tag1_en AS tag1' : 'rf.tag1'}, 
    ${lang === 'en' ? 'rf.tag2_en AS tag2' : 'rf.tag2'}, 
    ${lang === 'en' ? 'rf.tag3_en AS tag3' : 'rf.tag3'}, 
    rf.steps, 
    rf.images, 
    rf.difficulty, 
    ${lang === 'en' ? 'rf.difficulty_en AS difficulty' : 'rf.difficulty'}, 
    rf.budget, 
    ${lang === 'en' ? 'rf.budget_en AS budget' : 'rf.budget'}, 
    rf.people, 
    rf.prep_time, 
    rf.cooking_time, 
    rf.total_time,
    ${lang === 'en' ? 'ri.ingredient AS ingredient' : 'ri.ingredient'}, 
    ${lang === 'en' ? 'ri.unit AS unit' : 'ri.unit'}, 
    ${lang === 'en' ? 'ri.quantite AS quantite' : 'ri.quantite'}
  FROM 
    recetteformat rf
  LEFT JOIN 
    recetteingredients ri 
  ON 
    rf.id = ri.recetteid
`;
    const result = await pool.query(query);

    // Regrouper les ingrédients sous forme de tableau pour chaque recette
    const recettes = result.rows.reduce((acc, row) => {
      let recette = acc.find(r => r.id === row.id);
      if (recette) {
        // Ajouter l'ingrédient à la recette existante
        if (row.ingredient) {
          recette.ingredients.push({
            ingredient: row.ingredient,
            unit: row.unit,
            quantite: row.quantite,
          });
        }
      } else {
        // Créer une nouvelle recette
        recette = {
          id: row.id,
          title: row.title,
          url: row.url,
          rate: row.rate,
          tag1: row.tag1,
          tag2: row.tag2,
          tag3: row.tag3,
          difficulty: row.difficulty,
          budget: row.budget,
          people: row.people,
          prep_time: row.prep_time,
          cooking_time: row.cooking_time,
          total_time: row.total_time,
          steps: Array.isArray(row.steps) ? row.steps : [row.steps], // Assurez-vous que steps est un tableau
          images: Array.isArray(row.images) ? row.images : [row.images], // Assurez-vous que images est un tableau
          ingredients: row.ingredient ? [{
            ingredient: row.ingredient,
            unit: row.unit,
            quantite: row.quantite
          }] : []
        };
        acc.push(recette);
      }
      return acc;
    }, []);

    res.json(recettes);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes' });
  }
};


exports.getAllRecipesFiltered = async (req, res) => {
  const { tag1, tag2, tag3, searchTerm } = req.query;
  let query = `SELECT rf.*, ARRAY_AGG(ri.ingredient) as ingredients 
               FROM recetteformat rf 
               LEFT JOIN recetteingredients ri ON rf.id = ri.recetteid 
               WHERE 1=1`;
  const params = [];

  // Appliquer les filtres de tags
  if (tag1) {
    query += ` AND rf.tag1 = $${params.length + 1}`;
    params.push(tag1);
  }
  if (tag2) {
    query += ` AND rf.tag2 = $${params.length + 1}`;
    params.push(tag2);
  }
  if (tag3) {
    query += ` AND rf.tag3 = $${params.length + 1}`;
    params.push(tag3);
  }

  // Appliquer le filtre de recherche (titre ou ingrédient)
  if (searchTerm) {
    query += ` AND (rf.title ILIKE $${params.length + 1} OR EXISTS (SELECT 1 FROM recetteingredients ri WHERE ri.recetteid = rf.id AND ri.ingredient ILIKE $${params.length + 1}))`;
    params.push(`%${searchTerm}%`);
  }

  // Ajouter un GROUP BY pour éviter les doublons d’ingrédients par recette
  query += ` GROUP BY rf.id`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes filtrées:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes filtrées' });
  }
};