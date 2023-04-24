const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const Reservation = new Schema(
    {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        price: { type: Number },
        nameRoom: { type: String },
        location: { type: String },
        dateFrom: { type: Date },
        dateTo: { type: Date },
        totalDate: { type: Number },
        adult: { type: Number },
        children: { type: Number },
        extraService: { type: [Number] },
        status: { type: Number, default: 0 },
        totalPrice: { type: Number },
    },
    {
        timestamps: true,
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
    },
);

// Define a virtual property to format the dateFrom field
Reservation.virtual('formattedDateFrom').get(function () {
    return moment(this.dateFrom).format('DD/MM/YYYY');
});

// Define a virtual property to format the dateTo field
Reservation.virtual('formattedDateTo').get(function () {
    return moment(this.dateTo).format('DD/MM/YYYY');
});

// Calculate totalDate before saving the document
Reservation.pre('save', function (next) {
    const diffInMs = this.dateTo - this.dateFrom;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    this.totalDate = diffInDays;
    next();
});
module.exports = mongoose.model('Reservation', Reservation);
