const dbConfig = require("../../../backend/app/config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  // ... autres configurations
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.shoppinglist = require("../../../backend/app/models/shoppinglist.model.js")(sequelize, Sequelize);
db.shoppinglist_item = require("../../../backend/app/models/shoppinglist_item.model.js")(sequelize, Sequelize);
db.shoppinglist_user = require("../../../backend/app/models/shoppinglist_user.model.js")(sequelize, Sequelize);

// Associations
db.shoppinglist.associate(db);
db.shoppinglist_item.associate(db);
db.shoppinglist_user.associate(db);

module.exports = db;
