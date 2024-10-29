const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recette2', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ingredients: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cleaned_ingredients: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'recette2',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "recette2_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
