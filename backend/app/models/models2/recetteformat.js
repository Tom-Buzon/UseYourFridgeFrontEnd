const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recetteformat', {
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
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tag1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag4: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tag5: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    budget: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    people: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prep_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cooking_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'recetteformat',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "recetteformat_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
