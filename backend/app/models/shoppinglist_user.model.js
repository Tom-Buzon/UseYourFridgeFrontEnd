// app/models/shoppinglist_user.model.js

module.exports = (sequelize, DataTypes) => {
  const ShoppingListUser = sequelize.define('shoppinglist_user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shoppinglist_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  ShoppingListUser.associate = models => {
    ShoppingListUser.belongsTo(models.user, { foreignKey: 'userID' });
    ShoppingListUser.belongsTo(models.shoppinglist, { foreignKey: 'shoppinglist_id' });
  };

  return ShoppingListUser;
};
