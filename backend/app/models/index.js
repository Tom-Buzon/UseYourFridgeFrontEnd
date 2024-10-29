const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.frigo = require("../models/frigo.model.js")(sequelize, Sequelize);
db.recette = require("../models/recette.model.js")(sequelize, Sequelize);
db.ingredient = require("../models/ingredients.model.js")(sequelize, Sequelize);
db.recette_ingredients = require("../models/recette_ingredients.model")(sequelize, Sequelize);
db.mesure = require("../models/mesure.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles"
});

db.user.hasMany(db.frigo);

db.recette.hasMany(db.recette_ingredients);
db.ingredient.hasMany(db.recette_ingredients);
db.mesure.hasMany(db.recette_ingredients);

db.frigo.belongsToMany(db.ingredient, {
  through: "frigo_ingredients"
});

db.frigo.belongsToMany(db.user, {
  through: "frigo_users"
});




/* db.recette.belongsToMany(db.mesure, {
  through: "recette_ingredients"
});
 */
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.ROLES = ["user", "admin", "moderator"];



module.exports = db;
