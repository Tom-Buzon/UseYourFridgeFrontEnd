const db = require("../models");
const Frigo = db.frigo;
const User = db.user;
const FrigoIngredient = db.frigo_ingredients;
const FrigoUser = db.frigo_users;


exports.deleteIngredientById = async (req, res) => {
  const { id } = req.params;
  await FrigoIngredient.destroy({
    where: {
      ingredientId: id,
    },
  }).then(() => {

    res.send({ message: "Ingredient deleted successfully!" });
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the frigo."
      });
    });
};

exports.addIngredient = async (req, res) => {
  console.log(req.body);

  Frigo.findOne({
    where: {
      id: req.body.frigoId
    }
  })
    .then(frigo => {
      if (!frigo) {
        return res.status(404).send({ message: "frigo Not found." });
      }
      else {
        FrigoIngredient.create({
          frigoId: req.body.frigoId,
          ingredientId: req.body.ingredientId,
          mesureId: req.body.mesureId,
          quantity: req.body.quantity
        }).then(() => {

          res.send({ message: "Ingredient added successfully!" });
        })
      }


    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.addFrigo = async (req, res) => {
  // Validate request
  if (!req.body.nom) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Ingredient
  const frigo = {
    nom: req.body.nom,
    userId: req.body.userId

  };

  // Save Ingredient in the database
  Frigo.create(frigo)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the frigo."
      });
    });
};

exports.getFrigosByUserId = async (req, res) => {
  const id = req.params.id;

  Frigo.findAll({ where: { userId: id }, include: [{ model: db.ingredient }] })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Ingredient with id=" + id
      });
    });

}

exports.shareFrigoToUser = async (req, res) => {

  for (const userId of req.body.usersId) {

    FrigoUser.create({
      frigoId: req.body.frigoId,
      userId: userId
    }).then(() => {

      res.send({ message: "Frigo shared successfully!" });
    }).catch(err => {
      res.status(500).send({
        message: "Error sharing Frigo;"
      });
    });
  }

};

exports.getFrigosSharedByUserId = async (req, res) => {

  const id = req.params.id;
  User.findByPk(id, {
    include: [
      {
        model: Frigo,
        as: "frigos"
      },
    ],
  }).then(data => {
    res.send(data.frigos);
  })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Ingredient with id=" + id
      });
    });

}

exports.getingredients = async (req, res) => {
  Frigo.findAll({ include: [{ model: db.ingredient }] })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ingredients."
      });
    });


};