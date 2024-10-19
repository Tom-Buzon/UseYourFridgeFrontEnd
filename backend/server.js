const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
app.get('/api/recettes/titres', async (req, res) => {
  try {
    const result = await pool.query('SELECT titre FROM recettes');
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




// Start server
//app.listen(port, () => {
//  console.log(`Server running on port ${port}`);
//});
//
//Server pour tel
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});