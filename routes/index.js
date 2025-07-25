const express = require('express');
const { register, login, changePassword, logout } = require('../controller/user');

const router = express.Router();

router.use((req, res, next) => {
    console.log('Session Info:', req.session);
    next();
});

// Login route
router.post('/login', login);

// Register route
router.post('/register', register);

// Logout route
router.post('/logout', logout);

// Change password route
router.post('/change-password', changePassword);

// Default route
router.get('/', (req, res) => {
    res.send('Default endpoint');
});

module.exports = router;
