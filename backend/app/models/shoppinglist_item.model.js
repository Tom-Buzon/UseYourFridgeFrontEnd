// app/models/shoppinglist_item.model.js

module.exports = (sequelize, DataTypes) => {
  const ShoppingListItem = sequelize.define('shoppinglist_item', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    shoppinglist_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantite: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unit: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ingredient: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  ShoppingListItem.associate = models => {
    // Associer chaque item à une liste de courses avec l'alias 'shoppinglist'
    ShoppingListItem.belongsTo(models.shoppinglist, { foreignKey: 'shoppinglist_id', as: 'shoppinglist' });
  };

  return ShoppingListItem;
};
