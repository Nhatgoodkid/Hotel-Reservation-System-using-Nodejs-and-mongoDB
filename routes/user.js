const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');
const validator = require('../app/middlewares/validator');

// PAGE SIGN IN
router.get('/sign-in', validator.ensureAuthenticated, UserController.signIn);
router.post(
    '/sign-in',
    validator.validateLogin(),
    UserController.processSignIn,
);

// PAGE SIGN UP
router.get('/sign-up', validator.ensureAuthenticated, UserController.signUp);
router.post(
    '/sign-up',
    validator.validateRegister(),
    UserController.processSignUp,
);

// LOGOUT
router.get('/logout', UserController.logout);

// PROFILE
router.get('/', validator.isLogin, UserController.index);
// UPDATE INFORMATION USER
router.put('/updateInfo', UserController.updateInfo);

// UPDATE PASSWORD USER
router.put('/updatePassword', UserController.updatePassword);

module.exports = router;
