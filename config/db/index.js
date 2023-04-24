const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(
            'mongodb+srv://dcn22402:fARJ0YHlCiuM03Gd@hotel-management.x28tdal.mongodb.net/hotel_management',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        );
        console.log('Connect successfully !!!');
    } catch (error) {
        console.log('Connect Failed !!!');
    }
}

module.exports = { connect };
