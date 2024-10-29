const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recetteingredients', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recetteid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantite: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ingredient: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'recetteingredients',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "recetteingredients_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
