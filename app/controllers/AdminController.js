const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const moment = require('moment');

const { multipleMongooseToObject } = require('../../util/mongoose');

class AdminController {
    //[GET] /admins
    async index(req, res, next) {
        const user = req.session.user;
        const { period } = req.query;
      
        try {
          const totalRevenue = await getTotalRevenue(period);
      
          res.render('admin/dashboard', {
            user,
            layout: 'admin.hbs',
            totalRevenue,
            period
          });
        } catch (err) {
          next(err);
        }
    }

    //[GET] /customers
    showCus(req, res, next) {
        var user = req.session.user;
        User.find({})
            .then((users) => {
                res.render('admin/customers', {
                    user: user,
                    layout: 'admin.hbs',
                    users: multipleMongooseToObject(users),
                });
            })
            .catch(next);
    }

    //[GET] /reservations
    showRes(req, res, next) {
        var user = req.session.user;
        Reservation.find({})
            .then((reservations) => {
                res.render('admin/reservation', {
                    user: user,
                    layout: 'admin.hbs',
                    reservations: multipleMongooseToObject(reservations),
                });
            })
            .catch(next);
    }

    //[POST] add/reservations
    addRes(req, res) {
        const formData = req.body;
        const reservation = new Reservation(formData);
        reservation
            .save()
            .then(() => res.redirect('/admin/reservations'))
            .catch((error) => {});
    }

    //[PUT] edit/reservations
    editRes(req, res) {
        const formData = req.body;
        Reservation.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.redirect('/admin/reservations');
            })
            .catch((error) => {});
    }

    //[DELETE] delete/reservations/:id
    delRes(req, res) {
        Reservation.deleteOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.redirect('/admin/reservations');
            })
            .catch((error) => {});
    }

    //[GET] /rooms
    showRoom(req, res, next) {
        var user = req.session.user;
        Room.find({})
            .then((rooms) => {
                res.render('admin/room', {
                    user: user,
                    layout: 'admin.hbs',
                    rooms: multipleMongooseToObject(rooms),
                });
            })
            .catch(next);
    }

    //[POST] add/room
    addRoom(req, res) {
        const formData = req.body;
        const room = new Room(formData);
        room.save()
            .then(() => res.redirect('/admin/rooms'))
            .catch((error) => {});
    }

    //[PUT] edit/room/:id
    editRoom(req, res) {
        Room.updateOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.redirect('/admin/rooms');
            })
            .catch((error) => {});
    }

    //[DELETE] delete/room/:id
    deleteRoom(req, res, next) {
        Room.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('/admin/rooms'))
            .catch(next);
    }

    //[DELETE] delete/user/:id
    delCus(req, res) {
        User.deleteOne({ _id: req.params.id }, req.body)
            .then(() => {
                res.redirect('/admin/customers');
            })
            .catch((error) => {});
    }
}

async function getTotalRevenue(period) {
    const startDate = moment().startOf(period);
    const endDate = moment().endOf(period);
  
    const reservations = await Reservation.aggregate([
      {
        $match: {
          dateFrom: { $gte: startDate.toDate(), $lte: endDate.toDate() },
          status: 1 // Only include reservations with a "paid" status
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'week' ? '%Y-%U' : '%Y-%m',
              date: '$dateFrom'
            }
          },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  
    return reservations.map(r => ({ period: r._id, totalRevenue: r.totalRevenue }));
  }
module.exports = new AdminController();
