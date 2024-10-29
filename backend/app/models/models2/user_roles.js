const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_roles', {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
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
    tableName: 'user_roles',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "user_roles_pkey",
        unique: true,
        fields: [
          { name: "roleId" },
          { name: "userId" },
        ]
      },
    ]
  });
};
