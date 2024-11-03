//onst dbConfig = require("../config/db.config.js");
//
//onst Sequelize = require("sequelize");
//onst sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
// host: dbConfig.HOST,
// dialect: dbConfig.dialect,
// // ... autres configurations
//);
//
//onst db = {};
//
//b.Sequelize = Sequelize;
//b.sequelize = sequelize;
//
//b.user = require("./user.model.js")(sequelize, Sequelize);
//b.shoppinglist = require("./shoppinglist.model.js")(sequelize, Sequelize);
//b.shoppinglist_item = require("./shoppinglist_item.model.js")(sequelize, Sequelize);
//b.shoppinglist_user = require("./shoppinglist_user.model.js")(sequelize, Sequelize);
//
/// Associations
//b.shoppinglist.associate(db);
//b.shoppinglist_item.associate(db);
//b.shoppinglist_user.associate(db);
//
//odule.exports = db;
