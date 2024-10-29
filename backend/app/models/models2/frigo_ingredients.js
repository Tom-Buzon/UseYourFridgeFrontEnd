const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('frigo_ingredients', {
    frigoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'frigos',
        key: 'id'
      }
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'ingredients select distinc recetteingredients.ingredients',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'frigo_ingredients',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "frigo_ingredients_pkey",
        unique: true,
        fields: [
          { name: "frigoId" },
          { name: "ingredientId" },
        ]
      },
    ]
  });
};
