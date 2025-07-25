const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
require('dotenv').config();
const staticLogStream = require('fs').createWriteStream(path.join(__dirname, 'static.log'), { flags: 'a' });
const appLogStream = require('fs').createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
const indexRouter = require('./routes/index');

const app = express();

// Body parser config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser config
app.use(cookieParser());

// Morgan logging: split static asset logs

app.use(
    '/static',
    morgan('combined', {
        skip: (req) => !req.url.startsWith('/public'),
        stream: staticLogStream,
    })
);
app.use(
    morgan('dev', {
        skip: (req) => req.url.startsWith('/public'),
        stream: appLogStream,
    })
);

// Session store with DB storage (using file store as example)
const store_options = {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    clearExpired: true,
};
const sessionStore = new MySQLStore(store_options);
app.use(
    session({
        store: sessionStore,
        secret: '33labs_portal_secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if using HTTPS
    })
);

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Example routes
app.use('/', indexRouter);

// Add more routes as needed

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
