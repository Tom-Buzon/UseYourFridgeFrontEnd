const controller = require("../controllers/recette.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/recettes/titres-et-ingredients", controller.getTitreAndIngredients);

  app.get("/api/recettes/title", controller.getTitre);

  // Route pour récupérer tous les titres de la table recettes
  app.get('/api/recettes/title', controller.getRecipesTitles);

  app.post('/api/recettes/matching', controller.getMatchingsRecipes);

  app.get('/api/recettes/:id', controller.getRecipeById);

  //RECETTEFORMAT
  app.get('/api/recetteformat', controller.getAllRecipesFormat);

  app.get('/api/recetteformat/filter', controller.getAllRecipesFiltered);

  // Routes pour récupérer les valeurs distinctes de tags en fonction de la langue
  app.get('/api/recetteformat/tags/:tag', controller.getAllTagsByLang);


};

