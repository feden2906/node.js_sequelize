const router = require('express').Router();

const { carController } = require('../controller');
const { carMiddlewares, fileMiddlewares } = require('../middleware');

router.route('/')
    .post(
        fileMiddlewares.checkFile,
        carMiddlewares.isCarValid,
        carMiddlewares.doesCarExist,
        carController.createCar
    )
    .get(
        carMiddlewares.areNoCars, // queryBuilder vs Joi
        carController.getAllCars
    );

router.use('/:carId', carMiddlewares.isCarIdValid)
    .delete(
        carMiddlewares.isNoCar,
        carController.deleteCar
    )
    .get(
        carMiddlewares.isNoCar,
        carController.getCarById
    )
    .put(
        carMiddlewares.isNoCar,
        carController.updateCar
    );

module.exports = router;
