const db = require("../models");
const Frigo = db.frigo;
const FrigoUsers = db.frigo_users;
const User = db.user;



exports.deleteIngredientById = async (req, res) => {
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
};

exports.addIngredient = async (req, res) => {

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

  Frigo.findAll({where: { userId: id },include: [{model:db.ingredient}]})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Ingredient with id=" + id
      });
    });
 
  }

  exports.shareFridge = (userId, fridgeId) => {
    return User.findByPk(userId)
      .then((user) => {
        if (!user) {
          console.log("User not found!");
          return null;
        }
        return Frigo.findByPk(fridgeId).then((frigo) => {
          if (!frigo) {
            console.log("Fridge not found!");
            return null;
          }
  
          user.addFrigo(frigo);
          console.log(`>> added frigo id=${frigo.id} to user id=${user.id}`);
          return user;
        });
      })
      .catch((err) => {
        console.log(">> Error while adding Fridge to User: ", err);
      });
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
  Frigo.findAll({include: [{model:db.ingredient}]})
  .then(data => {
    console.log(data);
    res.json(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving ingredients."
    });
  });


};