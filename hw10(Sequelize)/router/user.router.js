const router = require('express').Router();

const { userController } = require('../controller');
const { authMiddlewares, fileMiddlewares, userMiddlewares } = require('../middleware');

router.route('/')
    .post(
        fileMiddlewares.checkFile,
        fileMiddlewares.checkPhotoForAvatar,
        userMiddlewares.isUserValid,
        userMiddlewares.doesUserExist,
        userController.createUser
    )
    .get(
        userMiddlewares.areNoUsers, // queryBuilder vs Joi
        userController.getAllUsers
    );

router.use('/:userId', userMiddlewares.isUserIdValid)
    .delete(
        authMiddlewares.checkAccessToken,
        userController.deleteUser
    )
    .get(
        userMiddlewares.isNoUser,
        userController.getUserById
    )
    .put(
        userMiddlewares.isNoUser,
        userController.updateUser
    );

module.exports = router;
