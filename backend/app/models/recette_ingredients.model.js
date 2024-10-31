module.exports = (sequelize, Sequelize) => {
    const Recette_ingredients = sequelize.define('recette_ingredients', {


      name: {
        type: Sequelize.STRING
      }
  });

  
  return Recette_ingredients;
};
