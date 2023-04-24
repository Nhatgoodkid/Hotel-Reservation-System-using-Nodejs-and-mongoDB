const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema(
    {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        password: { type: String },
        member: { type: Boolean },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', User);
