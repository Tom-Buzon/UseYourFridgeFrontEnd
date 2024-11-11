const { authJwt } = require("../middleware");
const controller = require("../controllers/notifications.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  
  app.post("/api/frigo/",controller.addNotification); 


  app.get("/api/notifications/:id",
  controller.getNotificationsByUserId
);


};

