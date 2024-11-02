// app/models/shoppinglist.model.js

module.exports = (sequelize, DataTypes) => {
  const ShoppingList = sequelize.define('shoppinglist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  ShoppingList.associate = models => {
    // Utiliser l'alias 'items' pour les articles de la liste de courses
    ShoppingList.hasMany(models.shoppinglist_item, { foreignKey: 'shoppinglist_id', as: 'items' });
    ShoppingList.belongsToMany(models.user, {
      through: models.shoppinglist_user,
      foreignKey: 'shoppinglist_id',
      otherKey: 'userID'
    });
  };

  return ShoppingList;
};
