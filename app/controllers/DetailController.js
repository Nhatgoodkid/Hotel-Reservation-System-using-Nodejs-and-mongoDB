const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const { mongooseToObject } = require('../../util/mongoose');

class DetailController {
    //[GET] /detail
    index(req, res, next) {
        var user = req.session.user;
        Room.findOne({ slug: req.params.slug })
            .then((room) => {
                res.render('details/bodyDetail', {
                    room: mongooseToObject(room),
                    user: user,
                    messages: req.flash(),
                });
            })
            .catch(next);
    }

    //[POST] detail/:slug/confirm
    confirm(req, res, next) {
        const formData = req.body;
        const reservation = new Reservation(formData);
        reservation
            .save()
            .then((savedReservation) => {
                // save the reservation ID to the session
                req.session.reservationId = savedReservation._id; 
                const slug = req.params.slug;
                res.redirect(`/detail/${slug}/confirm`);
            })
            .catch((error) => {});
    }

    //[GET] detail/:slug/confirm
    showConfirm(req, res, next) {
        const user = req.session.user;
        // get the reservation ID from the session instead of a query parameter
        const reservationId = req.session.reservationId;
        Room.findOne({ slug: req.params.slug })
            .then((room) => {
                return Reservation.findById(reservationId).then(
                    (reservation) => {
                        res.render('details/bodyConfirm', {
                            user,
                            reservation: mongooseToObject(reservation),
                            room: mongooseToObject(room),
                        });
                    },
                );
            })
            .catch(next);
    }

    //[GET] detail/:id/confirm-result
    showLastConfirm(req, res, next) {
        var user = req.session.user;
        // get the reservation ID from the session instead of a query parameter
        const reservationId = req.session.reservationId; 
        Reservation.findById(reservationId)
            .then((reservation) => {
                res.render('details/bodyResult', {
                    user,
                    reservation: mongooseToObject(reservation),
                });
            })
            .catch(next);
    }

    //[PUT] detail/:id/confirm-result
    lastConfirm(req, res, next) {
        Reservation.updateOne(
            { _id: req.params.id },
            { status: 1, ...req.body },
        )
            .then(() => {
                const id = req.params.id;
                res.redirect(`/detail/${id}/confirm-result`);
            })
            .catch(next);
    }
}
module.exports = new DetailController();
