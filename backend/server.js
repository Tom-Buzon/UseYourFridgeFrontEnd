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
require('./app/routes/user.routes')(app);
require('./app/routes/shoppinglist.routes')(app);

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



