const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.listen(3000, function () {
  console.log("server started on port 3000");
});

app.get("/", function (req, res) {
  // console.log(__dirname) ;
  res.sendFile(__dirname + "/index.html");
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});

// Routes
app.post('/api/query', async (req, res) => {
  const { text, params } = req.body;
  try {
    const result = await pool.query(text, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while querying the database' });
  }
});


app.get('/api/recettes/titres-et-ingredients', async (req, res) => {
  console.log('Route /api/recettes/titres-et-ingredients appelée');
  try {
    console.log('Exécution de la requête SQL');
    const result = await pool.query('SELECT * FROM recettes');
    console.log('Résultat de la requête:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des recettes:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des recettes' });
  }
});

// Route pour récupérer tous les ingredients du frigo
app.get('/api/frigo/ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, ingredients FROM frigo');
    //console.log('Données envoyées au front:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching the ingredients' });
  }
});


// Nouvelle route pour ajouter un ingrédient
app.post('/api/frigo/ingredients', (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) {
    return res.status(400).json({ message: 'L\'ingrédient est requis' });
  }

  const query = 'INSERT INTO frigo (ingredients) VALUES ($1)';
  pool.query(query, [ingredients], (err, result) => {
    if (err) {
      console.error('Erreur SQL:', err);
      res.status(500).json({ message: `Erreur lors de l'ajout de l'ingrédient: ${err.message}` });
    } else {
      res.status(201).json({ message: 'Ingrédient ajouté avec succès' });
    }
  });
});

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
  try {
    const query = `
      SELECT rf.id, rf.title, rf.url, rf.rate, rf.tag1, rf.tag2, rf.tag3, rf.tag4, rf.tag5,
             rf.difficulty, rf.budget, rf.people, rf.prep_time, rf.cooking_time, rf.total_time,
             ri.ingredient, ri.unit, ri.quantite
      FROM recetteformat rf
      LEFT JOIN recetteingredients ri ON rf.id = ri.recetteid
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

// Route pour récupérer les valeurs distinctes de tag1
app.get('/api/recetteformat/tags/tag1', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag1 FROM recetteformat WHERE tag1 IS NOT NULL`);
    const tag1Options = result.rows.map(row => row.tag1);
    console.log('Tag1 Options:', tag1Options);
    res.json(tag1Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag1):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag1)' });
  }
});

// Route pour récupérer les valeurs distinctes de tag2
app.get('/api/recetteformat/tags/tag2', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag2 FROM recetteformat WHERE tag2 IS NOT NULL`);
    const tag2Options = result.rows.map(row => row.tag2);
    console.log('Tag2 Options:', tag2Options);
    res.json(tag2Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag2):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag2)' });
  }
});

// Route pour récupérer les valeurs distinctes de tag3
app.get('/api/recetteformat/tags/tag3', async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT tag3 FROM recetteformat WHERE tag3 IS NOT NULL`);
    const tag3Options = result.rows.map(row => row.tag3);
    console.log('Tag3 Options:', tag3Options);
    res.json(tag3Options);
  } catch (err) {
    console.error('Erreur lors de la récupération des tags (tag3):', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des tags (tag3)' });
  }
});




