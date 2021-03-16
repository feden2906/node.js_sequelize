const db = require('../../dataBase/MySQL');

module.exports = {
    findAll: async () => {
        const [dbResp] = await db.query('SELECT * FROM students') || [];

        return dbResp;
    },

    createStu: (studentObj) => {
        const { age, gender, name } = studentObj;

        return db.query(`INSERT INTO students (age, gender, name) VALUE ('${age}', '${gender}', '${name}')`);
    }
};
