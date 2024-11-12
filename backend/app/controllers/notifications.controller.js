const db = require("../models");
const Notification = db.notification;


exports.addNotification = async (req, res) => {
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

exports.getNotificationsByUserId = async (req, res) => {
  const id = req.params.id;

  Notification.findAll({ where: { userId: id } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Notifications" + id
      });
    });

};

