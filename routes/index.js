const express = require('express');
const { register, login, changePassword, logout } = require('../controller/user');
const path = require('path');

const router = express.Router();

router.use((req, res, next) => {
    console.log('Session Info:', req.session);
    next();
});

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', login);

// Register route
router.post('/register', register);

// Logout route
router.post('/logout', logout);

// Change password route
router.post('/change-password', changePassword);

// Profile route
router.get('/profile', (req, res) => {
    // Check if user is authenticated
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }
    res.render('profile');
});

// Aligners cases route (existing functionality)
router.get('/aligners-cases', (req, res) => {
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }
    res.render('aligners_cases');
});

// Case details route
router.get('/cases/:caseId', (req, res) => {
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }
    const { caseId } = req.params;
    // In a real app, fetch case data by caseId
    res.render('case_details', {
        caseId,
    });
});

// Add treatment plan route
router.get('/add-treatment-plan/:caseId', (req, res) => {
    const { caseId } = req.params;
    res.render('add_treatment_plan', { caseId });
});

// Add new case routes
router.get('/add-case', (req, res) => {
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }
    res.render('add_case');
});

router.post('/add-case', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // TODO: Implement case creation logic
    // For now, just return success
    console.log('Case submission:', req.body);
    res.json({ message: 'Case submitted successfully', id: Date.now() });
});

router.get('/upload-stl', (req, res) => {
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }
    res.render('upload_stl');
});

router.post('/save-draft', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // TODO: Implement draft saving logic
    // For now, just return success
    console.log('Draft saved:', req.body);
    res.json({ message: 'Draft saved successfully', id: Date.now() });
});

// User management route
router.get('/user-management', (req, res) => {
    res.render('user_management');
});

// Create user route
router.get('/create-user', (req, res) => {
    res.render('create_user');
});

// User details route
router.get('/user-details/:userId', (req, res) => {
    const { userId } = req.params;
    res.render('user_details');
});

// Update user route
router.get('/update-user/:userId', (req, res) => {
    const { userId } = req.params;
    res.render('update_user');
});

// Toast route
router.get('/test-toast', (req, res) => {
    res.render('test/test-toast');
});

// Validation route
router.get('/test-validation', (req, res) => {
    res.render('test/test-validation');
});

// Default route
router.get('/', (req, res) => {
    res.send('Default endpoint');
});

module.exports = router;
