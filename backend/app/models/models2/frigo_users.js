const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('frigo_users', {
    frigoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'frigos',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'frigo_users',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "frigo_users_pkey",
        unique: true,
        fields: [
          { name: "frigoId" },
          { name: "userId" },
        ]
      },
    ]
  });
};
