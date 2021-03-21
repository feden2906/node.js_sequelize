const { DataTypes } = require('sequelize');

module.exports = (client) => {
    const Rating = client.define(
        'Rating',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            student_id: { type: DataTypes.INTEGER },
            lesson_id: { type: DataTypes.INTEGER },
            rating: { type: DataTypes.INTEGER }
        },
        {
            tableName: 'ratings',
            timestamps: false
        }
    );

    return Rating;
};
