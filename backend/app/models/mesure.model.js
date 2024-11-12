module.exports = (sequelize, Sequelize) => {
  const Mesure = sequelize.define("mesures", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    name_en: {
      type: Sequelize.STRING
    },
    short_name: {
      type: Sequelize.STRING
    },
    equivalence: {
      type: Sequelize.STRING
    },
    equivalence_name: {
      type: Sequelize.STRING
    },
    infinite: {
      type: Sequelize.BOOLEAN,
      default: false
    }
  },
  {
    timestamps: false,
  });

  return Mesure;
};
