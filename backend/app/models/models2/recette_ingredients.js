const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recette_ingredients', {
    recetteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'recettes',
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
    },
    mesureId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mesures',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'recette_ingredients',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "recette_ingredients_mesureId_fkey",
        fields: [
          { name: "mesureId" },
        ]
      },
      {
        name: "recette_ingredients_pkey",
        unique: true,
        fields: [
          { name: "recetteId" },
          { name: "ingredientId" },
        ]
      },
    ]
  });
};
