const express = require("express");
const cors = require("cors");
const { Pool } = require('pg');
const app = express();
/* 
var corsOptions = {
  origin: "http://localhost:8081"
}; */


const pool = new Pool({
  user: "useyourfridgeAdm",
  host: "useyourfridgedb.cz8kwm66811r.eu-west-3.rds.amazonaws.com",
  database: "useyourfridgeDB",
  password: "Admin!123",
  port: "5432",
});


app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();
// force: true will drop the table if it already exists
/* db.sequelize.sync({force: true}).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
}); */


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to useYourFridge application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/frigo.routes')(app);
require('./app/routes/recette.routes')(app);
require('./app/routes/ingredients.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  },{
    id: 2,
    name: "moderator"
  },{
    id: 3,
    name: "admin"
  });
 
}

// Route pour supprimer un ingrédient
app.delete('/api/frigo/ingredients/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'ID de l\'ingrédient non fourni' });
  }
  try {
    const query = 'DELETE FROM frigo WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Ingrédient non trouvé' });
    }
    res.status(200).json({ message: 'Ingrédient supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'ingrédient:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la suppression de l\'ingrédient' });
  }
});

// Route pour récupérer tous les titres de la table recettes
app.get('/api/recettes/title', async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM recettes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the titres' });
  }
});

app.post('/api/recettes/matching', async (req, res) => {
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
});

app.get('/api/recettes/:id', async (req, res) => {
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
});

//RECETTEFORMAT
app.get('/api/recetteformat', async (req, res) => {
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
        rf.difficulty, 
        ${lang === 'en' ? 'rf.difficulty_en AS difficulty' : 'rf.difficulty'}, 
        rf.budget, 
        ${lang === 'en' ? 'rf.budget_en AS budget' : 'rf.budget'}, 
        rf.people, 
        rf.prep_time, 
        rf.cooking_time, 
        rf.total_time,
        ${lang === 'en' ? 'ri.ingredient_en AS ingredient' : 'ri.ingredient'}, 
        ${lang === 'en' ? 'ri.unit_en AS unit' : 'ri.unit'}, 
        ${lang === 'en' ? 'ri.quantite_en AS quantite' : 'ri.quantite'}
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
});

app.get('/api/recetteformat/filter', async (req, res) => {
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
});

// Routes pour récupérer les valeurs distinctes de tags en fonction de la langue
app.get('/api/recetteformat/tags/:tag', async (req, res) => {
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
});


