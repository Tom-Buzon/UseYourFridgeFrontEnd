module.exports = (sequelize, Sequelize) => {
    const Recette =   sequelize.define('recettes', {

      title: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      url: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      rate: {
        type:  Sequelize.DECIMAL,
        allowNull: true
      },
      tag1: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      tag2: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      tag3: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      tag4: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      tag5: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      difficulty: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      budget: {
        type:  Sequelize.TEXT,
        allowNull: true
      },
      people: {
        type:  Sequelize.INTEGER,
        allowNull: true
      },
      prep_time: {
        type:  Sequelize.INTEGER,
        allowNull: true
      },
      cooking_time: {
        type:  Sequelize.INTEGER,
        allowNull: true
      },
      total_time: {
        type:  Sequelize.INTEGER,
        allowNull: true
      }
    });
  
    return Recette;
  };
  