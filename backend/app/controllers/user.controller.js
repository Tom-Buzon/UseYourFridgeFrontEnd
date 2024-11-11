const db = require("../models");

const User = db.user;

exports.getUsernameById = async (req, res) => {
  const id = req.params.id;

  User.findAll({where: { userId: id },include: [{attribute:username}]})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Ingredient with id=" + id
      });
    });
 
  };



  exports.getAllUsernameAndId = async (req, res) => {

  
    User.findAll({attributes: ['id', 'username']})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving all users" + id
        });
      });
   
    };
