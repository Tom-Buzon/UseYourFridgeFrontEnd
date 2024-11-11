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
db.notification = require("../models/notifications.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.frigo = require("../models/frigo.model.js")(sequelize, Sequelize);
db.recette = require("../models/recette.model.js")(sequelize, Sequelize);
db.ingredient = require("../models/ingredients.model.js")(sequelize, Sequelize);
db.recette_ingredients = require("../models/recette_ingredients.model.js")(sequelize, Sequelize);
db.frigo_ingredients = require("../models/frigo_ingredients.model.js")(sequelize, Sequelize);
db.frigo_users = require("../models/frigo_users.model.js")(sequelize, Sequelize);
db.mesure = require("../models/mesure.model.js")(sequelize, Sequelize);
db.ShoppingList = require("../models/shoppinglist.model.js")(sequelize, Sequelize);
db.ShoppingListItem = require("../models/shoppinglist_item.model.js")(sequelize, Sequelize);
db.ShoppingListUser = require("../models/shoppinglist_user.model.js")(sequelize, Sequelize);


db.role.belongsToMany(db.user, {
  through: "user_roles"
});

db.user.hasMany(db.frigo);
db.user.hasMany(db.notification);

db.frigo.belongsToMany(db.ingredient, { through: db.frigo_ingredients })
db.ingredient.belongsToMany(db.frigo, { through: db.frigo_ingredients })


db.frigo.belongsToMany(db.user, { through: db.frigo_users })
db.user.hasMany(db.frigo_users)


db.mesure.hasMany(db.frigo_ingredients);

db.recette.hasMany(db.recette_ingredients);
db.ingredient.hasMany(db.recette_ingredients);
db.mesure.hasMany(db.recette_ingredients);

//db.ShoppingList.associate(db);
//db.ShoppingListItem.associate(db);
//db.ShoppingListUser.associate(db);


  
  db.ShoppingList.hasMany(db.ShoppingListItem, {
    foreignKey: 'shoppinglist_id',
    as: 'items', // Alias utilisé dans les requêtes `include`
    onDelete: 'CASCADE',
    hooks: true
  });

 
  db.ShoppingList.belongsToMany(db.user, {
    through: db.ShoppingListUser,
    foreignKey: 'shoppinglist_id',
    otherKey: 'userID',
    as: 'users' // Alias utilisé dans les requêtes `include`
  });


  // Définition des associations
 
  
    db.ShoppingListItem.belongsTo(db.ShoppingList, {
      foreignKey: 'shoppinglist_id',
      as: 'shoppingList' // Alias utilisé dans les requêtes `include`
    });
 

  // Définition des associations
  
   
    db.ShoppingListUser.belongsTo(db.ShoppingList, {
      foreignKey: 'shoppinglist_id',
      as: 'shoppingList'
    });

    
    db.ShoppingListUser.belongsTo(db.user, {
      foreignKey: 'userID',
      as: 'user'
    });
  

  // Définition des associations
 



//db.shoppinglist.hasMany(db.shoppinglist_item);
//db.shoppinglist_item.belongsTo(db.shoppinglist);
//
//db.shoppinglist.hasMany(db.shoppinglist_user);
//db.shoppinglist_user.belongsTo(db.shoppinglist);


db.frigo.belongsToMany(db.ingredient, {
  through: "frigo_ingredients"
});



db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.ROLES = ["user", "admin", "moderator"];



module.exports = db;
