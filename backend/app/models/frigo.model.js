module.exports = (sequelize, Sequelize) => {
    const Frigo = sequelize.define("frigo", {
      nom: {
        type: Sequelize.STRING
      },
      favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
     
    },
    {
      timestamps: false,
    });
    

  
    return Frigo;
  };
  