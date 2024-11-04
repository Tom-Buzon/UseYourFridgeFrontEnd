// app/routes/shoppinglist.routes.js

const { authJwt } = require("../middleware");
const shoppinglist = require("../controllers/shoppinglist.controller.js");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  
  // Vérifier les méthodes disponibles dans le contrôleur
  console.log('Méthodes disponibles dans shoppinglist controller:', Object.keys(shoppinglist));

  

// Vérifier si createWithName est défini
 if (typeof shoppinglist.createWithName !== 'function') {
   console.error('La méthode createWithName n\'est pas définie dans le contrôleur shoppinglist.');
 }

// Créer une nouvelle liste de courses avec items
app.post("/api/shoppinglists", shoppinglist.create);

//// Créer une nouvelle liste de courses avec un nom
app.post("/api/shoppinglists/createWithName", shoppinglist.createWithName);
//
 // Ajouter des items à une liste existante
 app.post("/api/shoppinglists/:id/addItems", shoppinglist.addItems);

 // Récupérer toutes les listes de courses
 app.get("/api/shoppinglists", shoppinglist.findAll);

 app.delete('/api/shoppinglists/:id', shoppinglist.delete);

};
