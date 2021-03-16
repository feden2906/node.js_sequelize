const fs = require('fs-extra').promises;
const path = require('path');
const uuid = require('uuid').v1;

const { carMsg: { confirmMsg } } = require('../messages');
const { carService } = require('../service');
const { responseCodesEnum } = require('../constant');

module.exports = {
    createCar: async (req, res, next) => {
        try {
            const {
                body: { preferLang = 'ua' }, docs, photos, videos
            } = req;
            const car = await carService.createCar(req.body, preferLang);

            if (photos) {
                for (const photo of photos) {
                    const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(photo.name, 'photos', car._id);

                    // eslint-disable-next-line no-await-in-loop
                    await fs.mkdir(filesDir, { recursive: true });
                    // eslint-disable-next-line no-await-in-loop
                    await photo.mv(finalFilePath);
                    // eslint-disable-next-line no-await-in-loop
                    await carService.updateCarById(car._id, { photo: uploadPath });
                }
            }

            if (docs) {
                for (const doc of docs) {
                    const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(doc.name, 'docs', car._id);

                    // eslint-disable-next-line no-await-in-loop
                    await fs.mkdir(filesDir, { recursive: true });
                    // eslint-disable-next-line no-await-in-loop
                    await doc.mv(finalFilePath);
                    // eslint-disable-next-line no-await-in-loop
                    await carService.updateCarById(car._id, { doc: uploadPath });
                }
            }

            if (videos) {
                for (const video of videos) {
                    const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(video.name, 'videos', car._id);

                    // eslint-disable-next-line no-await-in-loop
                    await fs.mkdir(filesDir, { recursive: true });
                    // eslint-disable-next-line no-await-in-loop
                    await video.mv(finalFilePath);
                    // eslint-disable-next-line no-await-in-loop
                    await carService.updateCarById(car._id, { video: uploadPath });
                }
            }

            res.status(responseCodesEnum.CREATED).json(confirmMsg.CAR_CREATED[preferLang]);
        } catch (e) {
            next(e);
        }
    },

    getAllCars: async (req, res, next) => {
        try {
            const { query } = req;
            const cars = await carService.findAllCars(query);

            res.status(responseCodesEnum.OK).json(cars);
        } catch (e) {
            next(e);
        }
    },

    deleteCar: async (req, res, next) => {
        try {
            const { carId } = req.params;

            await carService.deleteCar(carId);

            res.json('Car is deleted').status(responseCodesEnum.NO_CONTENT);
        } catch (e) {
            next(e);
        }
    },

    getCarById: async (req, res, next) => {
        try {
            const { params: { carId } } = req;
            const car = await carService.findCarById(carId);

            res.status(responseCodesEnum.OK).json(car);
        } catch (e) {
            next(e);
        }
    },

    updateCar: async (req, res, next) => {
        try {
            const { carId } = req.params;
            const { preferLang = 'ua' } = req.body;

            await carService.shiftCar(carId, req.body);

            res.status(responseCodesEnum.OK).json(confirmMsg.CAR_UPDATED[preferLang]);
        } catch (e) {
            next(e);
        }
    }
};

function _filesDirBuilder(itemName, itemType, itemId) {
    const pathWithoutStatic = path.join('car', `${itemId}`, itemType);
    const filesDir = path.join(process.cwd(), 'static', pathWithoutStatic);
    const fileExtension = itemName.split('.').pop();
    const fileName = `${uuid()}.${fileExtension}`;
    const finalFilePath = path.join(filesDir, fileName);
    const uploadPath = path.join(pathWithoutStatic, fileName);

    return { finalFilePath, uploadPath, filesDir };
}
