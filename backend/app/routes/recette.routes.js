const { authJwt } = require("../middleware");
const controller = require("../controllers/recette.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/recettes/titres-et-ingredients", controller.getTitreAndIngredients);

  app.get("/api/recettes/title",controller.getTitre); 

/*   app.post("/api/recettes/matching",
    controller.AddMatching
  );

  app.get("/api/recettes/:id",
  controller.getIngredientsById
);
 */
};

