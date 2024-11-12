const express = require("express");
const cors = require("cors");
const app = express();

const { Pool } = require('pg');
var bcrypt = require("bcryptjs");

require('dotenv').config()


// Database connection
const pool = new Pool({
  user: process.env.DB_USER|| "postgres",
  host: process.env.DB_HOST|| "localhost",
  database: process.env.DB_NAME  || "UseYourFridge",
  password: process.env.DB_PASSWORD|| "admin",
  port: process.env.DB_PORT || 5432,
});

/* 
var corsOptions = {
  origin: "http://localhost:8081"
}; */

app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;
const Mesure = db.mesure;
const User = db.user;
const Frigo = db.frigo;


//-----------------------------------------------------------------------------------------------------------------------------

db.sequelize.sync({ alter: true });

// DECOMMENTER CE BLOC POUR RECREER LE SCHEMA DE BASE DE DONNEES

/* db.sequelize.sync({ force: true }).then(() => {
  console.log('Drop and Resync Database with { force: true }');

  //SI TRUE COPIE LES DONNEES DES TABLES RECETTESFORMAT2 ET INGREDIENTUNIQUE VERS INGREDIENTS ET RECETTES
  initial(true);
  //SI FALSE, BEN SA LE FAIS PAS QUOI ^^
  //initial(false);
}); */

//-----------------------------------------------------------------------------------------------------------------------------


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to useYourFridge application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/frigo.routes')(app);
require('./app/routes/recette.routes')(app);
require('./app/routes/ingredients.routes')(app);
require('./app/routes/notifications.routes')(app);
require('./app/routes/mesures.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/shoppinglist.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});




function initial(copy) {
  Role.bulkCreate([{
    id: 1,
    name: "user"
  }, {
    id: 2,
    name: "moderator"
  }, {
    id: 3,
    name: "admin"
  }]);

  User.bulkCreate([{
    id: 1,
    username: "tom",
    password: bcrypt.hashSync("tom", 8)
  }, {
    id: 2,
    username: "leo",
    password: bcrypt.hashSync("leo", 8)
  }, {
    id: 3,
    username: "test",
    password: bcrypt.hashSync("test", 8)
  }, {
    id: 4,
    username: "sueann",
    password: bcrypt.hashSync("sueann", 8)
  }]);

  Frigo.bulkCreate([{
    id: 1,
    nom: "frigo de tom",
    userId: 1
  }, {
    id: 2,
    nom: "frigo de leo",
    userId: 2
  }, {
    id: 3,
    nom: "frigo de test",
    userId: 3
  }, {
    id: 4,
    nom: "Sueann fridge",
    userId: 4
  }]);
  Mesure.bulkCreate([{
    id: 1,
    name: "kilogramme",
    name_en: "kilogramme",
    short_name: "kg",
    equivalence: "1000",
    equivalence_name: "g"
  }, {
    id: 2,
    name: "gramme",
    name_en: "gramme",
    short_name: "g",
    equivalence: "0.001",
    equivalence_name: "kg"
  }, {
    id: 3,
    name: "litre",
    name_en: "liter",
    short_name: "L",
    equivalence: "1000",
    equivalence_name: "mL"
  }, {
    id: 4,
    name: "millilitre",
    name_en: "milliliter",
    short_name: "mL",
    equivalence: "0.001",
    equivalence_name: "L"
  }, {
    id: 5,
    name: "cuillère à soupe",
    name_en: "cuillère à soupe",
    short_name: "c.s.",
    equivalence: "15",
    equivalence_name: "mL",
    infinite: true
  }, {
    id: 6,
    name: "cuillère à café",
    name_en: "cuillère à café",
    short_name: "c.c.",
    equivalence: "5",
    equivalence_name: "mL",
    infinite: true
  }, {
    id: 7,
    name: "once",
    name_en: "once",
    short_name: "oz",
    equivalence: "28.35",
    equivalence_name: "g"
  }, {
    id: 8,
    name: "tasse",
    name_en: "cup",
    short_name: "cup",
    equivalence: "240",
    equivalence_name: "mL",
    infinite: true
  }, {
    id: 9,
    name: "gallon",
    name_en: "gallon",
    short_name: "gal",
    equivalence: "3.785",
    equivalence_name: "L"
  }, {
    id: 10,
    name: "aucune",
    name_en: "none",
    short_name: "",
    equivalence: "",
    equivalence_name: ""
  }]);


  if (copy) {
    try {
      const result = pool.query('INSERT INTO ingredients(id,ingredient, ingredient_en) SELECT id,ingredient, ingredient_en FROM ingredientunique;');

    } catch (err) {
      console.error(err);
    }

    try {
      const result = pool.query('INSERT INTO recettes(id, title, url, rate, tag1, tag2, tag3, tag4, tag5, difficulty, budget, people, prep_time, cooking_time, total_time, title_en, tag1_en, tag2_en, tag3_en, difficulty_en, budget_en) SELECT id, title, url, rate, tag1, tag2, tag3, tag4, tag5, difficulty, budget, people, prep_time, cooking_time, total_time, title_en, tag1_en, tag2_en, tag3_en, difficulty_en, budget_en FROM recetteformat2;');

    } catch (err) {
      console.error(err);
    }
  }
}


