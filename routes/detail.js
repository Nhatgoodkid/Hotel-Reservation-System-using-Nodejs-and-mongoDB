const detailController = require('../app/controllers/DetailController');
const express = require('express');
const router = express.Router();
const {
    validateConfirmForm,
    checkConfirmValidationResult,
} = require('../app/middlewares/validator');
router.get('/:id/confirm-result', detailController.showLastConfirm);
router.put('/:id/confirm-result', detailController.lastConfirm);
router.post(
    '/:slug/confirm',
    validateConfirmForm,
    checkConfirmValidationResult,
    detailController.confirm,
);
router.get('/:slug/confirm', detailController.showConfirm);
router.get('/:slug', detailController.index);

module.exports = router;
