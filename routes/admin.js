const express = require('express');
const router = express.Router();
const validator = require('../app/middlewares/validator');

const AdminController = require('../app/controllers/AdminController');

router.delete('/delete/customer/:id', AdminController.delCus);

router.delete('/delete/reservation/:id', AdminController.delRes);

router.put('/edit/reservation/:id', AdminController.editRes);

router.post('/add/reservation', AdminController.addRes);

router.delete('/delete/room/:id', AdminController.deleteRoom);

router.put('/edit/room/:id', AdminController.editRoom);

router.post('/add/room', AdminController.addRoom);

router.get('/rooms', AdminController.showRoom);

router.get('/reservations', AdminController.showRes);

router.get('/customers', AdminController.showCus);

router.get('/', validator.isLogin, validator.isAdmin, AdminController.index);

module.exports = router;
