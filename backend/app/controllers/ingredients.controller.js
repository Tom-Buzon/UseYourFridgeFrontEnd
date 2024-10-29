const db = require("../models");
const Ingredient = db.ingredient;

// Create and Save a new Ingredient
exports.create = (req, res) => {
  // Validate request
  if (!req.body.nom) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Ingredient
  const ingredient = {
    nom: req.body.nom
    
  };

  // Save Ingredient in the database
  Ingredient.create(ingredient)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Ingredient."
      });
    });
};

// Retrieve all Ingredients from the database.
exports.findAll = (req, res) => {/* 
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null; */

  Ingredient.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ingredients."
      });
    });
};

// Find a single Ingredient with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Ingredient.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Ingredient with id=" + id
      });
    });
};
