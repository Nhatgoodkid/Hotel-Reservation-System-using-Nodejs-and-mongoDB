const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const { multipleMongooseToObject } = require('../../util/mongoose');
class SiteController {
    //[GET] /
    index(req, res) {
        var user = req.session.user;
        res.render('site/home', {
            user: user,
        });
    }

    //[GET] /history
    showHistory(req, res) {
        var user = req.session.user;
        const email = req.query.email;
        Reservation.find({ email }).then((reservations) => {
            res.render('site/historyBooking', {
                reservations: multipleMongooseToObject(reservations),
                user: user,
            });
        });
    }

    //[GET] /booking
    showBooking(req, res, next) {
        let page = parseInt(req.query.page) || 1;
        const limit = 4;
        var user = req.session.user;
        const startIndex = (page - 1) * limit;

        // get the filters from the URL query string
        const location = req.query.location;
        const adult = req.query.adult;
        const children = req.query.children;
        const rating = req.query.rating;
        const kind = req.query.kind;
        const status = req.query.status;
        const price = req.query.price;

        // create the filter object
        const filterLocation = location ? { location: location } : {};
        const filterAdult = adult ? { adult: { $gte: parseInt(adult) } } : {};
        const filterChildren = children
            ? { children: { $gte: parseInt(children) } }
            : {};
        const filterRating = rating
            ? { rating: rating.map((e) => parseInt(e)) }
            : {};
        const filterKind = kind ? { kind: kind } : {};
        const filterStatus = status ? { status: parseInt(status) } : {};
        const filterPrice = price ? { price: { $lte: parseInt(price) } } : {};

        const filter = {
            ...filterLocation,
            ...filterAdult,
            ...filterChildren,
            ...filterRating,
            ...filterKind,
            ...filterStatus,
            ...filterPrice,
        };

        //Get the sort parameter from URL String
        const sortParam = req.query.sort;
        let sort = {};

        if (sortParam === 'low-price') {
            sort = { price: 1 };
        } else if (sortParam === 'high-price') {
            sort = { price: -1 };
        }

        Reservation.find({
            ...filterLocation,
            dateFrom: { $lte: req.query.dateTo },
            dateTo: { $gte: req.query.dateFrom },
        })
            .then((reservations) => {
                return Room.countDocuments(filter).then((count) => {
                    // get list of unique locations
                    const listReservation = reservations.map((e) => e.nameRoom);
                    return Room.distinct('location').then((locations) => {
                        // get filtered rooms
                        return Room.find(filter)
                            .sort(sort)
                            .skip(startIndex)
                            .limit(limit)
                            .then((rooms) => {
                                return Room.aggregate([
                                    { $match: filter },
                                    {
                                        $group: {
                                            _id: null,
                                            maxPrice: { $max: '$price' },
                                        },
                                    },
                                ]).then((result) => {
                                    const maxPrice =
                                        result.length > 0
                                            ? result[0].maxPrice
                                            : 0;
                                    res.render('site/bodyBooking', {
                                        rooms: multipleMongooseToObject(rooms),
                                        reservations: listReservation,
                                        locations: locations,
                                        roomCount: count,
                                        currentPage: page,
                                        user: user,
                                        maxPrice: maxPrice,
                                        totalPages: Math.ceil(count / limit),
                                    });
                                });
                            });
                    });
                });
            })
            .catch(next);
    }
}
module.exports = new SiteController();
