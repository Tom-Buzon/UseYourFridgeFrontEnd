const { authJwt } = require("../middleware");
const controller = require("../controllers/mesures.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

 // Create a new mesures
 app.post("/api/mesures", controller.create);

 // Retrieve all mesures
 app.get("/api/mesures", controller.findAll);

 // Retrieve a single mesures with id
 app.get("/api/mesures/:id", controller.findOne);


 

};

