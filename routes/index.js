const express = require('express');
const { register, login, changePassword, logout, get_user_profile, getAllUsers, getUserCounts, changePasswordUser, activateUser, deactivateUser, edit_user, deleteUser } = require('../controller/user');
const path = require('path');
const axios = require('axios');

const router = express.Router();
const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// API authentication middleware (returns JSON instead of redirect)
const requireAuthAPI = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

router.use((req, res, next) => {
    res.locals.user = req.session.user ? [req.session.user] : null;
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
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const userProfile = await axios.get(`${baseURL}/get_profile?id=${req.session.user.id}`);       
        res.render('profile', {
            user: userProfile.data.user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Profile route
router.get('/get_profile', get_user_profile);

// Aligners cases route (existing functionality)
router.get('/aligners-cases', requireAuth, (req, res) => {
    res.render('aligners_cases');
});

// Case details route
router.get('/cases/:caseId', requireAuth, (req, res) => {
    const { caseId } = req.params;
    // In a real app, fetch case data by caseId
    res.render('case_details', {
        caseId,
    });
});

// Add treatment plan route
router.get('/add-treatment-plan/:caseId', requireAuth, (req, res) => {
    const { caseId } = req.params;
    res.render('add_treatment_plan', { caseId });
});

// Add new case routes
router.get('/add-case', requireAuth, (req, res) => {
    res.render('add_case');
});

router.post('/add-case', requireAuth, (req, res) => {
    // TODO: Implement case creation logic
    // For now, just return success
    console.log('Case submission:', req.body);
    res.json({ message: 'Case submitted successfully', id: Date.now() });
});

router.get('/upload-stl', requireAuth, (req, res) => {
    res.render('upload_stl');
});

router.post('/save-draft', requireAuth, (req, res) => {
    // TODO: Implement draft saving logic
    // For now, just return success
    console.log('Draft saved:', req.body);
    res.json({ message: 'Draft saved successfully', id: Date.now() });
});

// User management route
router.get('/user-management', requireAuth, async (req, res) => {
    const { success } = req.query; 
    res.render('user_management', {
        user: req.session.user,
        successMessage: success || null
    });
});

// Create user route
router.get('/create-user', requireAuth, (req, res) => {
    res.render('create_user');
});

// User details route
router.get('/user-details/:userId', requireAuth, async (req, res) => {
    const { userId } = req.params;
    const { success } = req.query; 
    try {
        const userProfile = await axios.get(`${baseURL}/get_profile?id=${userId}`);       
        res.render('user_details', {
            user: userProfile.data.user,
            successMessage: success || null
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user route
router.get('/update-user/:userId', requireAuth, async (req, res) => {
    const { userId } = req.params;
    try {
        const userProfile = await axios.get(`${baseURL}/get_profile?id=${userId}`);       
        res.render('update_user', {
            user: userProfile.data.user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user route
router.put('/update-user', requireAuth, edit_user);

// Get current user info route
router.get('/api/current-user', requireAuth, (req, res) => {
    // Return user info without sensitive data like password
    const { password, ...userInfo } = req.session.user;
    res.json({ user: userInfo });
});

// Get all users with filtering, searching, and sorting
router.get('/get-users', requireAuth, getAllUsers);

// Get user counts by status
router.get('/get-user-counts', requireAuth, getUserCounts);

// Change password for user
router.post('/change-password-user', requireAuth, changePasswordUser);

// Activate user
router.post('/activate-user', requireAuth, activateUser);

// Deactivate user
router.post('/deactivate-user', requireAuth, deactivateUser);

// Delete user
router.post('/delete-user', requireAuth, deleteUser);

// Side menu component route - renders with user data
router.get('/components/side-menu', requireAuth, (req, res) => {
    res.render('components/side-menu');
});

// Default route
router.get('/', (req, res) => {
    //redirect to login
    res.redirect('/login');
});


// Default route
router.get('/simulation', (req, res) => {
    res.render('simulation');
});

//testing ui routes
// Toast route
router.get('/test-toast', (req, res) => {
    res.render('test/test-toast');
});

// Validation route
router.get('/test-validation', (req, res) => {
    res.render('test/test-validation');
});

// Select validation test route
router.get('/test-select-validation', (req, res) => {
    res.render('test/test-select-validation');
});
module.exports = router;
