const siteRouter = require('./site');
const userRouter = require('./user');
const detailRouter = require('./detail');
const adminRouter = require('./admin');
function route(app) {
    app.use('/admin', adminRouter);

    app.use('/detail', detailRouter);

    app.use('/user', userRouter);

    app.use('/', siteRouter);

    app.use('*', function (req, res) {
        res.status(404).render('error', {
            layout: false,
        });
    });
}

module.exports = route;
