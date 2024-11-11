module.exports = (sequelize, Sequelize) => {
    const Frigo_users = sequelize.define('frigo_users', {
      
      shared: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }

      
  },
  {
    timestamps: false,
  });

  
  return Frigo_users;
};
