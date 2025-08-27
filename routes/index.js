const express = require('express');
const { register, login, changePassword, logout, get_user_profile, getAllUsers, getUserCounts, changePasswordUser, activateUser, deactivateUser, edit_user, deleteUser } = require('../controller/user');
const path = require('path');
const { update_case, update_stl_case, getAllCases, getCaseCounts, get_patient_details_data, get_patient_treatment_details_data, get_patient_model_data, get_normal_case_data, get_upload_stl_data } = require('../controller/case');
const { get_file_with_signedurl } = require('../controller/file')

const router = express.Router();

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
        const userProfile = await get_user_profile(req.session.user.id);       
        res.render('profile', {
            user: userProfile[0]
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
router.get('/cases/:caseId', requireAuth, async (req, res) => {
    const { caseId } = req.params;
    try {
        const patient_details = await get_patient_details_data(caseId);
        res.render('case_details', {
            caseId,
            patient_details: patient_details[0],
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/get_patient_details_data', requireAuth, get_patient_details_data);
router.get('/get_patient_treatment_details_data', requireAuth, get_patient_treatment_details_data);
router.get('/get_patient_model', requireAuth, get_patient_model_data);
router.get('/get_normal_case_data', requireAuth, get_normal_case_data);
router.get('/get_upload_stl_data', requireAuth, get_upload_stl_data);

// Add treatment plan route
router.get('/add-treatment-plan/:caseId', requireAuth, (req, res) => {
    const { caseId } = req.params;
    res.render('add_treatment_plan', { caseId });
});

// Add new case routes
router.get('/add-case', requireAuth, (req, res) => {
    res.render('add_case');
});

router.post('/add-case', requireAuth, update_case);
router.post('/add-case/:caseid', requireAuth, update_case);

router.post('/add-case-stl', requireAuth, update_stl_case);
router.post('/add-case-stl/:caseid', requireAuth, update_stl_case);

// Get all cases with filtering, searching, and sorting
router.get('/get-cases', requireAuth, getAllCases);

// Get cases counts by status
router.get('/get-case-counts', requireAuth, getCaseCounts);

// Get treatment details
router.get('/get-patient-treatment-details', requireAuth, get_patient_treatment_details_data);

// Get file with signedurl
router.get('/file/:caseid/:fileid', get_file_with_signedurl);

router.get('/update-case', requireAuth, async (req, res) => {
    const { caseId } = req.query;
    try {
        const patient_details = await get_patient_details_data(caseId);
        res.render('update_case', { caseId, patient_details: patient_details[0] });
    } catch (error) {
        console.error('Error fetching patient details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Set case as draft
router.post('/cases/:caseId/set-draft', requireAuthAPI, async (req, res) => {
    try {
        const { caseId } = req.params;
        
        res.status(200).json({ message: 'Case set as draft successfully' });
    } catch (error) {
        console.error('Error setting case as draft:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/upload-stl', requireAuth, (req, res) => {
    res.render('upload_stl');
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
        const userProfile = await get_user_profile(userId);       
        res.render('user_details', {
            user: userProfile[0],  // userProfile is an array, take the first element
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
        const userProfile = await get_user_profile(userId);       
        res.render('update_user', {
            user: userProfile[0]  // userProfile is an array, take the first element
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
