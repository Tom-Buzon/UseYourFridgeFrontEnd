// backend/app/models/user.model.js
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    }
  },
  {
    timestamps: false,
  });

  return User;
};