const studentService = require('../service/MySQL/student.service');
const { transactionInstance } = require('../dataBase/MySQL').getInstance();

const { responseCodesEnum } = require('../constant');
const { studentMsg: { confirmMsg: { STUDENT_CREATED } } } = require('../messages');

module.exports = {
    getAll: async (req, res, next) => {
        try {
            const students = await studentService.findAll();

            res.status(responseCodesEnum.OK).json(students);
        } catch (e) {
            next(e);
        }
    },

    createStudent: async (req, res, next) => {
        const transaction = await transactionInstance(); // before "try" only
        try {
            await studentService.createStu(req.body, transaction);

            // throw new Error('rrr');

            await studentService.updateStu(17, { name: 'Dosya' }, transaction);
            await transaction.commit();
            res.status(responseCodesEnum.CREATED).json(STUDENT_CREATED.ua);
        } catch (e) {
            await transaction.rollback();
            next(e);
        }
    }
};
