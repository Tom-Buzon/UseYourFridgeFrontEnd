module.exports = (sequelize, Sequelize) => {
    const Ingredient =  sequelize.define('ingredients', {


      ingredient: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ingredient_en: {
        type: Sequelize.STRING,
        allowNull: true
      }
    },
    {
      timestamps: false,
    });
  
    return Ingredient;
  };
  