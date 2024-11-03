// app/models/shoppinglist_user.model.js

module.exports = (sequelize, DataTypes) => {
  const ShoppingListUser = sequelize.define('shoppinglist_users', {
    shoppinglist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ShoppingLists', // Nom exact du modèle
        key: 'id'
      }
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Nom exact du modèle
        key: 'id'
      }
    }
    // Ajoutez d'autres champs si nécessaire
  }, {
    tableName: 'shoppinglist_users',
    freezeTableName: true
  });

  

  return ShoppingListUser;
};