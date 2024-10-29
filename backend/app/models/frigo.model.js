module.exports = (sequelize, Sequelize) => {
    const Frigo = sequelize.define("frigo", {
      nom: {
        type: Sequelize.STRING
      }
     
    });
  
    return Frigo;
  };
  