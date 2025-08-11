const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const staticLogStream = require('fs').createWriteStream(path.join(__dirname, 'static.log'), { flags: 'a' });
const appLogStream = require('fs').createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
const indexRouter = require('./routes/index');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow specific file types
        const allowedTypes = /jpeg|jpg|png|gif|stl|ply|zip|obj/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || 
                        file.mimetype === 'application/octet-stream' || // for STL files
                        file.mimetype === 'application/zip';
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Make upload middleware available globally
app.use('/add-case', upload.any());
app.use('/save-draft', upload.any());

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
app.use('/assets/css', express.static(path.join(__dirname, '/assets/css')));
app.use('/assets/js', express.static(path.join(__dirname, '/assets/js')));
app.use('/assets/images', express.static(path.join(__dirname, '/assets/images')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Example routes
app.use('/', indexRouter);

// Add more routes as needed

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
