// Load environment variables first
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const multer = require('multer');
const path = require('path');
const staticLogStream = require('fs').createWriteStream(path.join(__dirname, 'static.log'), { flags: 'a' });
const appLogStream = require('fs').createWriteStream(path.join(__dirname, 'app.log'), { flags: 'a' });
const indexRouter = require('./routes/index');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3')

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_NAME,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);

    const folderMap = {
    // STL files
    upper_scan: 'stl/',
    lower_scan: 'stl/',
    bite_scan: 'stl/',
    
    // photos
    front: 'photos/',
    smiling: 'photos/',
    right_side: 'photos/',
    buccal_top: 'photos/',
    buccal_bottom: 'photos/',
    buccal_right: 'photos/',
    buccal_center: 'photos/',
    buccal_left: 'photos/',
    
    // xray
    xray: 'xray/',
    
    // other
    other: 'other/',

    // document
    documents: 'documents/',

    // ipr
    ipr: 'ipr/'
    };
    
    const folder = folderMap[file.fieldname] || 'misc/';
    
    const fileName = `${folder}${req.body.name}-${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: s3Storage,
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

const uploadAny = upload.any();

// Make upload middleware available globally
app.use('/add-case', uploadAny);
app.use('/add-case-stl', uploadAny);
app.use('/add-simulation-plan', uploadAny);
app.use('/save-draft', uploadAny);

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
        cookie: { 
            secure: false, // Set to true if using HTTPS
            maxAge: 24 * 60 * 60 * 1000 // Default to 24 hours in milliseconds
        }
    })
);

// Import and apply remember me middleware
const { rememberMeMiddleware } = require('./middleware/middleware');
app.use(rememberMeMiddleware);

// Global middleware to make user session data available in all templates
app.use((req, res, next) => {
    // Make user data available in all templates
    res.locals.user = req.session.user ? [req.session.user] : null;
    res.locals.currentUser = req.session.user || null;
    next();
});

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
