module.exports = (sequelize, Sequelize) => {
    const Ingredient =  sequelize.define('ingredients', {

      recetteid: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quantite: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ingredient: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  
    return Ingredient;
  };
  