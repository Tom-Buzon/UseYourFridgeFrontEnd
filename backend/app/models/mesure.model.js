module.exports = (sequelize, Sequelize) => {
  const Mesure = sequelize.define("mesures", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  });

  return Mesure;
};
