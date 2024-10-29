const { authJwt } = require("../middleware");
const controller = require("../controllers/ingredients.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

 // Create a new ingredients
 app.post("/api/ingredients", controller.create);

 // Retrieve all ingredients
 app.get("/api/ingredients", controller.findAll);

 // Retrieve a single ingredients with id
 app.get("/api/ingredients/:id", controller.findOne);


 

};

