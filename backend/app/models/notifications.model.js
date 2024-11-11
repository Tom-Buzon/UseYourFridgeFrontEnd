module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define('notifications', {


        creatorId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        read: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    },
        {
            timestamps: false,
        });

    return Notification;
};
