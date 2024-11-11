module.exports = (sequelize, Sequelize) => {
    const Frigo_ingredients = sequelize.define('frigo_ingredients', {


      quantity: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      
  },
  {
    timestamps: false,
  });

  
  return Frigo_ingredients;
};
