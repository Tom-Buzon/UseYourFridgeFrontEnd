// app/routes/shoppinglist.routes.js

const { authJwt } = require("../middleware");

module.exports = app => {
  const shoppinglist = require("../controllers/shoppinglist.controller.js");
  
  // Vérifier les méthodes disponibles dans le contrôleur
  console.log('Méthodes disponibles dans shoppinglist controller:', Object.keys(shoppinglist));

  var router = require("express").Router();

// Vérifier si createWithName est défini
 if (typeof shoppinglist.createWithName !== 'function') {
   console.error('La méthode createWithName n\'est pas définie dans le contrôleur shoppinglist.');
 }

// Créer une nouvelle liste de courses avec items
    router.post("/", [authJwt.verifyToken], shoppinglist.create);

//// Créer une nouvelle liste de courses avec un nom
router.post("/createWithName", [authJwt.verifyToken], shoppinglist.createWithName);
//
 // Ajouter des items à une liste existante
router.post("/:id/addItems", [authJwt.verifyToken], shoppinglist.addItems);

 // Récupérer toutes les listes de courses
 router.get("/", [authJwt.verifyToken], shoppinglist.findAll);

 router.delete('/:id', [authJwt.verifyToken], shoppinglist.delete);

 // Autres routes si nécessaires

  app.use('/api/shoppinglists', router);
};
