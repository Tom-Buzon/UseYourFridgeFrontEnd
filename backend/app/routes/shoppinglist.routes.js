// app/routes/shoppinglist.routes.js

const { authJwt } = require("../middleware");

module.exports = app => {
  const shoppinglist = require("../controllers/shoppinglist.controller.js");

  var router = require("express").Router();

  // Créer une nouvelle liste de courses
  router.post("/", [authJwt.verifyToken], shoppinglist.create);

  // Récupérer toutes les listes de courses de l'utilisateur
  router.get("/", [authJwt.verifyToken], shoppinglist.findAll);

  app.use('/api/shoppinglists', router);
};
