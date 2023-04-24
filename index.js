const { engine } = require('express-handlebars');
const express = require('express');
const db = require('./config/db');
const path = require('path');
const route = require('./routes');
const session = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const port = 3000;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Connect to database
db.connect();

//Middleware
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());
app.use(methodOverride('_method'));
// Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            eq: (a, b) => a === b,
            sum: (a, b) => a + b,
            mul: (a, b) => a * b,
            times: (n, block) => {
                //For i in range n do:
                var accum = '';
                for (var i = 0; i < n; ++i) accum += block.fn(i);
                return accum;
            },
            checkStatus: (a) => {
                if (a == 0) {
                    return 'Unavailable';
                } else return 'Available';
            },
            period: (period) => {
                switch (period) {
                    case 'day':
                        return 'Daily';
                    case 'week':
                        return 'Weekly';
                    case 'month':
                        return 'Monthly';
                    default:
                        return '';
                }
            },
            createPagination: (currentPage, totalPages, options) => {
                var html = '';
                var i = 1;
                var pageLimit = 4;
                var left = Math.max(currentPage - Math.floor(pageLimit / 2), 1);
                var right = Math.min(left + pageLimit - 1, totalPages);
                html = `<nav>
                <ul class = "pagination justify-content-center mt-4">
                    <li class="page-item">`;
                //Add a "Previoust" link if current page is not the 1st page
                if (currentPage !== 1) {
                    html +=
                        `<a class="page-link" style="cursor: pointer;" id="previous" href="?page=` +
                        (currentPage - 1) +
                        `" data-page="${
                            currentPage - 1
                        }"> << Previous</a></li>`;
                }

                //Add page links
                for (i = left; i <= right; i++) {
                    if (i == currentPage) {
                        html +=
                            '<li class="page-item active style="cursor: pointer;""><a class="page-link">' +
                            i +
                            '</a></li>';
                    } else {
                        html +=
                            `<li class="page-item"><a class="page-link" style="cursor: pointer;" data-page="${i}" href="?page=` +
                            i +
                            '">' +
                            i +
                            '</a></li>';
                    }
                }
                //Add a "Next" link if current is not the last page
                if (currentPage !== totalPages) {
                    html +=
                        '<a class="page-link" style="cursor: pointer;" href="?page=' +
                        (currentPage + 1) +
                        `" data-page="${currentPage + 1}">Next >></a>`;
                }
                html += `</li> </ul> </nav>`;
                return html;
            },
            findInArray: (array, string, options) => {
                const isFound = array.includes(string);
                if (isFound) {
                    return options.fn(this);
                }

                return options.inverse(this);
            },
        },
    }),
);

app.set('view engine', 'hbs');

// Define COOKIES
app.use(cookieParser('my-secret-key'));

// Define SESSION
app.use(
    session({
        secret: 'my-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 10 * 60 * 1000,
        },
    }),
);

// FLASH
app.use(flash());

// Route
route(app);

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});
