const db = require("../models");
const Recette = db.recette;



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
