// const mysql2 = require('mysql2');
//
// const {
//  DATABASE, HOST, ROOT_DB_PASSWORD, USER
// } = require('../../config/config');
//
// const connection = mysql2.createConnection({
//     user: USER,
//     password: ROOT_DB_PASSWORD,
//     database: DATABASE,
//     host: HOST
// });
//
// module.exports = connection.promise();

const fs = require('fs');
const path = require('path');
const { DataTypes, Sequelize } = require('sequelize');

const { DATABASE, ROOT_DB_PASSWORD, USER } = require('../../config/config');

module.exports = () => {
    let instance;

    const initConnection = () => {
        const client = new Sequelize(DATABASE, USER, ROOT_DB_PASSWORD, { dialect: 'mysql' });
        const models = {};
        const modelsPath = path.join(process.cwd(), 'dataBase', 'MySQL', 'models');

        const getModels = () => {
            fs.readdir(modelsPath, (err, files) => {
                files.forEach((file) => {
                    const [model] = file.split('.');
                    // eslint-disable-next-line import/no-dynamic-require
                    const modelFile = require(path.join(modelsPath, model));

                    models[model] = modelFile(client, DataTypes);
                });
            });
        };

        return {
            getModel: (modelName) => models[modelName],
            setModels: () => getModels()
        };
    };

    return {
        getInstance: () => {
            if (!instance) {
                instance = initConnection(); // .getModel('Student')
            }

            return instance;
        }
    };
};
