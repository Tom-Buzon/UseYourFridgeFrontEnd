const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('frigo', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ingredients: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_expiration: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'frigo',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "frigo_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
