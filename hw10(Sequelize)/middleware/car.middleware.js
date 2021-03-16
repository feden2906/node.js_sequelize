const { carMsg: { errorMsg } } = require('../messages');
const carService = require('../service/car.service');
const {
    carValidators: { createCarValidator, findCarByQueryValidator },
    commonValidators: { mongoIdValidator }
} = require('../validators');

module.exports = {
    isCarValid: (req, res, next) => {
        try {
            const { error } = createCarValidator.validate(req.body);

            if (error) {
                throw new Error(error.details[0].message);
            }

            next();
        } catch (e) {
            next(e);
        }
    },

    isCarIdValid: (req, res, next) => {
        try {
            const { carId } = req.params;

            const { error } = mongoIdValidator.validate(carId);

            if (error) {
                throw new Error(error.details[0].message);
            }

            next();
        } catch (e) {
            next(e);
        }
    },

    doesCarExist: async (req, res, next) => {
        try {
            const { preferLang = 'ua' } = req.body;
            const cars = await carService.findAllCars(req.body);

            if (cars.length) {
                throw new Error(errorMsg.CAR_EXISTS[preferLang]);
            }

            next();
        } catch (e) {
            next(e);
        }
    },

    areNoCars: async (req, res, next) => {
        try {
            const cars = await carService.findAllCars(req.query);
            const { error } = findCarByQueryValidator.validate(cars);

            if (!cars.length) {
                throw new Error(error.details[0].message);
            }

            next();
        } catch (e) {
            next(e);
        }
    },

    isNoCar: async (req, res, next) => {
        try {
            const { params: { carId }, body: { preferLang = 'ua' } } = req;
            const car = await carService.findCarById(carId);

            if (!car) {
                throw new Error(errorMsg.NO_CAR[preferLang]);
            }

            next();
        } catch (e) {
            next(e);
        }
    },
};
