const { authJwt } = require("../middleware");
const controller = require("../controllers/frigo.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.delete("/api/frigo/ingredients/:id", controller.deleteIngredientById);

  app.post("/api/frigo/ingredients",controller.addIngredient); 
  
  app.post("/api/frigo/",controller.addFrigo); 

  app.get("/api/frigo/ingredients",
    controller.getingredients
  );

  app.get("/api/frigo/:id",
  controller.getFrigosByUserId
);

app.get("/api/frigo/shared/:id",
controller.getFrigosSharedByUserId
);

};

