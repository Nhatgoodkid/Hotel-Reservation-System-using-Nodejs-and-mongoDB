const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const express = require('express');
const app = express();

module.exports.validateRegister = function () {
    return [
        body('name').notEmpty().withMessage('Tên không được để trống'),
        body('phone')
            .notEmpty()
            .withMessage('Số điện thoại không được để trống')
            .isNumeric()
            .withMessage('Số điện thoại không đúng')
            .isLength({ min: 10, max: 10 })
            .withMessage('Số điện thoại không đúng'),
        body('email')
            .exists()
            .withMessage('Email đã tồn tại')
            .notEmpty()
            .withMessage('Email không được để trống')
            .isEmail()
            .withMessage('Email không đúng')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject('Email đã tồn tại');
                    }
                });
            }),
        body('password')
            .notEmpty()
            .withMessage('Mật khẩu không được để trống')
            .isLength({ min: 6 })
            .withMessage('Mật khẩu ít nhất 6 ký tự'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu nhập lại không khớp');
            }
            return true;
        }),
    ];
};

module.exports.validateLogin = function () {
    return [
        body('email').notEmpty().withMessage('Email không được để trống'),
        body('password')
            .notEmpty()
            .withMessage('Mật khẩu không được để trống')
            .isLength({ min: 6 })
            .withMessage('Mật khẩu ít nhất 6 ký tự'),
    ];
};

module.exports.isLogin = function (req, res, next) {
    if (!req.session.user) {
        res.redirect('/user/sign-in');
        return;
    }

    next();
};

module.exports.isAdmin = function (req, res, next) {
    var admin = req.session.user;
    if (admin.email !== 'admin') {
        return res.render('error', { layout: false });
    }
    next();
};

module.exports.ensureAuthenticated = function (req, res, next) {
    if (req.session.user) {
        res.redirect('/');
        return;
    }
    next();
};

exports.validateConfirmForm = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('phone').isMobilePhone().withMessage('Phone number is not valid'),
    body('chkPolicy')
        .isBoolean()
        .withMessage('You must agree to the terms and conditions'),
    body('dateFrom').isDate().withMessage('Check-in date is not valid'),
    body('dateTo').isDate().withMessage('Check-out date is not valid'),
];

exports.checkConfirmValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect(`/detail/${req.params.slug}`);
    }
    next();
};
