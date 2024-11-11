const db = require("../models");
const Mesure = db.mesure;

// Create and Save a new Mesure
exports.create = (req, res) => {
  // Validate request
  if (!req.body.nom) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Mesure
  const mesure = {
    nom: req.body.nom
    
  };

  // Save Mesure in the database
  Mesure.create(mesure)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Mesure."
      });
    });
};

// Retrieve all Mesures from the database.
exports.findAll = (req, res) => {/* 
  const title = req.query.title;
  var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null; */

  Mesure.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving mesures."
      });
    });
};

// Find a single Mesure with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Mesure.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Mesure with id=" + id
      });
    });
};
