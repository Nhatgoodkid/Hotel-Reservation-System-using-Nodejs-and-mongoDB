const express = require('express');
const router = express.Router();

const SiteController = require('../app/controllers/SiteController');

router.get('/history', SiteController.showHistory);

router.get('/booking', SiteController.showBooking);

router.get('/', SiteController.index);

module.exports = router;
