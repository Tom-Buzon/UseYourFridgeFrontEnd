const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ingredients select distinc recetteingredients', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    prix: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    date_expiration: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ingredients select distinc recetteingredients',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "ingredients_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
