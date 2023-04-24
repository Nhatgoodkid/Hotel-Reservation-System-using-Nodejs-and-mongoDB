const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const Room = new Schema(
    {
        nameRoom: { type: String },
        kind: { type: String },
        rating: { type: Number },
        location: { type: String },
        adult: { type: Number },
        children: { type: Number },
        bedroom: { type: Number },
        bathroom: { type: Number },
        price: { type: Number },
        image: { type: String },
        description: { type: String },
        status: { type: Number },
        slug: { type: String, slug: 'nameRoom', unique: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Room', Room);
