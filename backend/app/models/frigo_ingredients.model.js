module.exports = (sequelize, Sequelize) => {
    const Frigo_ingredients = sequelize.define('frigo_ingredients', {


      quantity: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      
  });

  
  return Frigo_ingredients;
};
