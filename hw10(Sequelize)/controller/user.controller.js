const fs = require('fs-extra').promises;
const path = require('path');
const uuid = require('uuid').v1;

const { emailActionsEnum: { CREATION_OF_ACC, DELETION_OF_ACC } } = require('../constant');
const { mailService, userService } = require('../service');
const { passwordHasher } = require('../helpers');
const { responseCodesEnum } = require('../constant');
const { userMsg: { confirmMsg } } = require('../messages');

module.exports = {
    createUser: async (req, res, next) => {
        try {
            const {
                body: {
                    email, name, password, preferLang = 'ua'
                },
                avatar, docs, videos
            } = req;
            const hashPassword = await passwordHasher.hash(password);
            const user = await userService.createUser({ ...req.body, password: hashPassword });

            if (avatar) {
                // const pathWithoutStatic = path.join('user', `${user._id}`, 'photos');
                // const photoDir = path.join(process.cwd(), 'static', pathWithoutStatic);
                // const fileExtension = avatar.name.split('.').pop();
                // const photoName = `${uuid()}.${fileExtension}`;
                // const finalPhotoPath = path.join(photoDir, photoName);

                const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(avatar.name, 'photos', user._id);

                await fs.mkdir(filesDir, { recursive: true });
                await avatar.mv(finalFilePath);
                await userService.updateUserById(user._id, { avatar: uploadPath });
            }

            if (docs) {
                for (const doc of docs) {
                    const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(doc.name, 'docs', user._id);

                    // eslint-disable-next-line no-await-in-loop
                    await fs.mkdir(filesDir, { recursive: true });
                    // eslint-disable-next-line no-await-in-loop
                    await doc.mv(finalFilePath);
                    // eslint-disable-next-line no-await-in-loop
                    await userService.updateUserById(user._id, { doc: uploadPath });
                }
            }

            if (videos) {
                for (const video of videos) {
                    const { finalFilePath, uploadPath, filesDir } = _filesDirBuilder(video.name, 'videos', user._id);

                    // eslint-disable-next-line no-await-in-loop
                    await fs.mkdir(filesDir, { recursive: true });
                    // eslint-disable-next-line no-await-in-loop
                    await video.mv(finalFilePath);
                    // eslint-disable-next-line no-await-in-loop
                    await userService.updateUserById(user._id, { video: uploadPath });
                }
            }

            await mailService.sendMail(email, CREATION_OF_ACC, { userName: name }); // нейм - обязательное поле при создании юзера

            res.status(responseCodesEnum.CREATED).json(confirmMsg.USER_CREATED[preferLang]);
        } catch (e) {
            next(e);
        }
    },

    getAllUsers: async (req, res, next) => {
        try {
            const { query } = req;
            const users = await userService.findAllUsers(query);

            res.status(responseCodesEnum.OK).json(users);
        } catch (e) {
            next(e);
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const { params: { userId }, user } = req;

            await userService.deleteUser(userId);
            await mailService.sendMail(user.email, DELETION_OF_ACC, { userName: user.name });

            // eslint-disable-next-line max-len
            res.json('User is deleted').status(responseCodesEnum.NO_CONTENT); // если ставить статус 204 No Content -  то он(если будет идти первым по коду) перебивает инфо джейсона json('User is deleted') и на выходе будет пустота
        } catch (e) {
            next(e);
        }
    },

    getUserById: async (req, res, next) => {
        try {
            const { params: { userId } } = req;
            const user = await userService.findUserById(userId);

            res.status(responseCodesEnum.OK).json(user);
        } catch (e) {
            next(e);
        }
    },

    updateUser: async (req, res, next) => {
        try {
            const { userId } = req.params;
            const { preferLang = 'ua' } = req.body;

            await userService.shiftUser(userId, req.body);

            res.status(responseCodesEnum.OK).json(confirmMsg.USER_UPDATED[preferLang]);
        } catch (e) {
            next(e);
        }
    }
};

function _filesDirBuilder(itemName, itemType, itemId) {
    const pathWithoutStatic = path.join('user', `${itemId}`, itemType);
    const filesDir = path.join(process.cwd(), 'static', pathWithoutStatic);
    const fileExtension = itemName.split('.').pop();
    const fileName = `${uuid()}.${fileExtension}`;
    const finalFilePath = path.join(filesDir, fileName);
    const uploadPath = path.join(pathWithoutStatic, fileName);

    return { finalFilePath, uploadPath, filesDir };
}
