// app/models/shoppinglist.model.js
module.exports = (sequelize, DataTypes) => {
  const ShoppingList = sequelize.define('shoppinglists', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
    // Ajoutez d'autres champs si nécessaire
  }, {
    tableName: 'shoppinglists', // Correspond exactement au nom de la table
    freezeTableName: true      // Empêche Sequelize de pluraliser ou modifier le nom de la table
  },
  {
    timestamps: false,
  });

  


  return ShoppingList;
};
