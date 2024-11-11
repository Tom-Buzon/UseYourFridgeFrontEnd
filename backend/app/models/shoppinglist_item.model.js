// app/models/shoppinglist_item.model.js

module.exports = (sequelize, DataTypes) => {
  const ShoppingListItem = sequelize.define('shoppinglist_items', {
    ingredient: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantite: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    inFrigo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    }
    // Ajoutez d'autres champs si nécessaire
  }, {
    tableName: 'shoppinglist_items', // Correspond exactement au nom de la table
    freezeTableName: true            // Empêche Sequelize de modifier le nom de la table
  },
  {
    timestamps: false,
  });



  return ShoppingListItem;
};