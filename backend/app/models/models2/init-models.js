var DataTypes = require("sequelize").DataTypes;
var _frigo = require("./frigo");
var _frigo_ingredients = require("./frigo_ingredients");
var _frigo_users = require("./frigo_users");
var _frigos = require("./frigos");
var _ingredients = require("./ingredients");
var _ingredients select distinc recetteingredients = require("./ingredients select distinc recetteingredients");
var _mesures = require("./mesures");
var _recette2 = require("./recette2");
var _recette_ingredients = require("./recette_ingredients");
var _recetteformat = require("./recetteformat");
var _recetteingredients = require("./recetteingredients");
var _recettes = require("./recettes");
var _roles = require("./roles");
var _user_roles = require("./user_roles");
var _users = require("./users");

function initModels(sequelize) {
  var frigo = _frigo(sequelize, DataTypes);
  var frigo_ingredients = _frigo_ingredients(sequelize, DataTypes);
  var frigo_users = _frigo_users(sequelize, DataTypes);
  var frigos = _frigos(sequelize, DataTypes);
  var ingredients = _ingredients(sequelize, DataTypes);
  var ingredients select distinc recetteingredients = _ingredients select distinc recetteingredients(sequelize, DataTypes);
  var mesures = _mesures(sequelize, DataTypes);
  var recette2 = _recette2(sequelize, DataTypes);
  var recette_ingredients = _recette_ingredients(sequelize, DataTypes);
  var recetteformat = _recetteformat(sequelize, DataTypes);
  var recetteingredients = _recetteingredients(sequelize, DataTypes);
  var recettes = _recettes(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var user_roles = _user_roles(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  frigos.belongsToMany(ingredients select distinc recetteingredients.ingredients, { as: 'ingredientId_ingredients select distinc recetteingredients.ingredients', through: frigo_ingredients, foreignKey: "frigoId", otherKey: "ingredientId" });
  frigos.belongsToMany(users, { as: 'userId_users', through: frigo_users, foreignKey: "frigoId", otherKey: "userId" });
  ingredients select distinc recetteingredients.ingredients.belongsToMany(frigos, { as: 'frigoId_frigos', through: frigo_ingredients, foreignKey: "ingredientId", otherKey: "frigoId" });
  ingredients select distinc recetteingredients.ingredients.belongsToMany(recettes, { as: 'recetteId_recettes', through: recette_ingredients, foreignKey: "ingredientId", otherKey: "recetteId" });
  recettes.belongsToMany(ingredients select distinc recetteingredients.ingredients, { as: 'ingredientId_ingredients select distinc recetteingredients.ingredients_recette_ingredients', through: recette_ingredients, foreignKey: "recetteId", otherKey: "ingredientId" });
  roles.belongsToMany(users, { as: 'userId_users_user_roles', through: user_roles, foreignKey: "roleId", otherKey: "userId" });
  users.belongsToMany(frigos, { as: 'frigoId_frigos_frigo_users', through: frigo_users, foreignKey: "userId", otherKey: "frigoId" });
  users.belongsToMany(roles, { as: 'roleId_roles', through: user_roles, foreignKey: "userId", otherKey: "roleId" });
  frigo_ingredients.belongsTo(frigos, { as: "frigo", foreignKey: "frigoId"});
  frigos.hasMany(frigo_ingredients, { as: "frigo_ingredients", foreignKey: "frigoId"});
  frigo_users.belongsTo(frigos, { as: "frigo", foreignKey: "frigoId"});
  frigos.hasMany(frigo_users, { as: "frigo_users", foreignKey: "frigoId"});
  frigo_ingredients.belongsTo(ingredients select distinc recetteingredients.ingredients, { as: "ingredient", foreignKey: "ingredientId"});
  ingredients select distinc recetteingredients.ingredients.hasMany(frigo_ingredients, { as: "frigo_ingredients", foreignKey: "ingredientId"});
  recette_ingredients.belongsTo(ingredients select distinc recetteingredients.ingredients, { as: "ingredient", foreignKey: "ingredientId"});
  ingredients select distinc recetteingredients.ingredients.hasMany(recette_ingredients, { as: "recette_ingredients", foreignKey: "ingredientId"});
  recette_ingredients.belongsTo(mesures, { as: "mesure", foreignKey: "mesureId"});
  mesures.hasMany(recette_ingredients, { as: "recette_ingredients", foreignKey: "mesureId"});
  recette_ingredients.belongsTo(recettes, { as: "recette", foreignKey: "recetteId"});
  recettes.hasMany(recette_ingredients, { as: "recette_ingredients", foreignKey: "recetteId"});
  user_roles.belongsTo(roles, { as: "role", foreignKey: "roleId"});
  roles.hasMany(user_roles, { as: "user_roles", foreignKey: "roleId"});
  frigo_users.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(frigo_users, { as: "frigo_users", foreignKey: "userId"});
  frigos.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(frigos, { as: "frigos", foreignKey: "userId"});
  user_roles.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(user_roles, { as: "user_roles", foreignKey: "userId"});

  return {
    frigo,
    frigo_ingredients,
    frigo_users,
    frigos,
    ingredients,
    ingredients select distinc recetteingredients,
    mesures,
    recette2,
    recette_ingredients,
    recetteformat,
    recetteingredients,
    recettes,
    roles,
    user_roles,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
