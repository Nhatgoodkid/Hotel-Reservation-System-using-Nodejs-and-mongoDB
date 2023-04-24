const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { mongooseToObject } = require('../../util/mongoose');

class UserController {
    //[GET] /
    index(req, res) {
        var user = req.session.user;

        User.findById(user._id).then((user) => {
            res.render('user/profile', {
                user: mongooseToObject(user),
            });
        });
    }

    //[PUT] Update Information
    updateInfo(req, res) {
        var formData = req.body;
        var user = req.session.user;

        User.updateOne({ _id: user._id }, formData)
            .then(() => {
                res.json({
                    message: 'Cập nhật thành công!',
                });
            })
            .catch((error) => {});
    }

    updatePassword(req, res) {
        var formData = req.body;
        var user = req.session.user;
        let saltRounds = 10;
        var curPassword = formData.curPassword;
        var newPassword = formData.newPassword;

        User.findOne({ _id: user._id }).then((user) => {
            bcrypt.compare(curPassword, user.password, function (err, result) {
                if (err) {
                    throw err;
                } else if (result) {
                    bcrypt
                        .hash(newPassword, saltRounds)
                        .then((hashedPassword) => {
                            User.updateOne(
                                { _id: user._id },
                                { password: hashedPassword },
                            ).then(() => {
                                res.json({
                                    message: 'Cập nhật password thành công!',
                                });
                            });
                        });
                } else {
                    res.json({ err: true });
                }
            });
        });
    }

    //[GET] /signIn
    signIn(req, res) {
        res.render('user/formSignIn');
    }

    //[POST] /sign-in
    processSignIn(req, res) {
        let errors = validationResult(req);
        let formData = req.body;
        let plainPassword = formData.password;
        let msgError = errors.errors[0] ? errors.errors[0].msg : '';

        // Xuất lỗi
        if (!errors.isEmpty()) {
            req.flash('error', msgError);
            return res.json({
                err: true,
                errorMessage: req.flash('error'),
                user: formData,
            });
        }

        User.findOne({ email: formData.email })
            .then((user) => {
                bcrypt
                    .compare(plainPassword, user.password)
                    .then((result) => {
                        if (result) {
                            // Send back cookie for client
                            req.session.user = user;
                            res.cookie('UID', user._id, {
                                signed: true,
                                httpOnly: true,
                            });
                            res.redirect('/');
                        } else {
                            req.flash('error', 'Mật khẩu không đúng');
                            return res.json({
                                err: true,
                                errorMessage: req.flash('error'),
                                user: formData,
                            });
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            })
            .catch(() => {
                req.flash('error', 'Email không tồn tại');
                res.json({
                    err: true,
                    errorMessage: req.flash('error'),
                    user: formData,
                });
            });
    }

    //[GET] /signUp
    signUp(req, res) {
        res.render('user/formSignUp');
    }

    // [POST] /signUp
    processSignUp(req, res, next) {
        let errors = validationResult(req);
        let formData = req.body;
        let plainPassword = formData.password;
        let saltRounds = 10;
        let msgError = errors.errors[0] ? errors.errors[0].msg : '';
        if (!errors.isEmpty()) {
            req.flash('error', msgError);
            return res.json({
                err: true,
                errorMessage: req.flash('error'),
                user: formData,
            });
        }

        bcrypt
            .hash(plainPassword, saltRounds)
            .then((hashedPassword) => {
                formData.password = hashedPassword;
                User.create(formData)
                    .then(() => {
                        formData.password = plainPassword;
                        req.flash('success', 'Đăng ký thành công');
                        res.render('user/formSignUp', {
                            successMessage: req.flash('success'),
                            user: formData,
                        });
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => {
                console.error(err);
            });
    }

    //[POST] /logout
    logout(req, res, next) {
        req.session.destroy();
        res.clearCookie('UID');
        res.redirect('/');
    }
}
module.exports = new UserController();
