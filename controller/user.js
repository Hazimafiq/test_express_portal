const User = require('../model/User');
const CustomError = require('../errors/CustomError');

// Register user
exports.register = async (req, res) => {
    try {
        const { username, fullName, phoneNumber, email, clinic, address, country, password, confirmPassword, role, postcode, city, state } = req.body;
        
        // Debug logging (only in test environment)
        if (process.env.NODE_ENV === 'test') {
            console.log('🔍 Debug - Received data:', {
                username: !!username,
                fullName: !!fullName,
                phoneNumber: !!phoneNumber,
                email: !!email,
                clinic: !!clinic,
                country: !!country,
                password: !!password,
                confirmPassword: !!confirmPassword,
                role: !!role
            });
        }
        
        if (!username || !password || !confirmPassword || !role || !fullName || !phoneNumber || !email || !country || !clinic ) {
            console.log('❌ Validation failed: Required fields missing');
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            console.log('❌ Validation failed: Passwords do not match');
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Validation failed: Invalid email format');
            return res.status(400).json({ message: 'Invalid email format' });
        }
        
        // Password strength validation
        if (password.length < 8) {
            console.log('❌ Validation failed: Password too short');
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        
        // Check for at least one number, one uppercase, one lowercase, and one special character
        const hasNumber = /\d/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (process.env.NODE_ENV === 'test') {
            console.log('🔍 Debug - Password validation:', {
                length: password.length,
                hasNumber,
                hasUpperCase,
                hasLowerCase,
                hasSpecialChar
            });
        }
        
        if (!hasNumber || !hasUpperCase || !hasLowerCase || !hasSpecialChar) {
            console.log('❌ Validation failed: Password complexity requirements not met');
            return res.status(400).json({ message: 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character' });
        }
        
        if (process.env.NODE_ENV === 'test') {
            console.log('✅ All validations passed, calling User.register...');
        }
        const user = await User.register(req.body);
        if (process.env.NODE_ENV === 'test') {
            console.log('✅ User created successfully');
        }
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        // Handle specific error for user already exists
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User.login(username, password);
        req.session.user = user;
        
        if (rememberMe === 'on' || rememberMe === true) {
            
            // Extend the session to 30 days
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            
            // Generate a remember me token
            const { token, expiresAt } = await User.generateRememberToken(user.id);
            
            // Set a secure HTTP-only cookie with the token
            // Cookie will expire at the same time as the token
            res.cookie('remember_token', token, {
                httpOnly: true,
                secure: process.env.STATUS === 'production', 
                expires: expiresAt,
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds (backup to expires)
            });
        } else {
            
            // Ensure the session is set to 24 hours (in case it was modified elsewhere)
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            // Clear any existing remember me token
            res.clearCookie('remember_token', {
                httpOnly: true,
                secure: process.env.STATUS === 'production',
                path: '/',
                sameSite: 'lax'
            });
        }
        
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

// Get one user details
exports.get_user_profile = async (req, res) => {
    try {
        // If called as HTTP endpoint, get id from query
        // If called directly, treat req as the userId
        const id = typeof req === 'object' && req.query ? req.query.id : req;
        
        const user = await User.get_profile_data(id);
        
        // If res is provided, it's an HTTP request
        if (res) {
            res.status(200).json({ user });
        } else {
            // If no res, return the data directly
            return user;
        }
    } catch (err) {
        if (res) {
            // HTTP request error handling
            if (err instanceof CustomError) {
                return res.status(err.statusCode).json({ message: err.message });
            } else {
                console.error(err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        } else {
            // Direct call error handling - rethrow the error
            throw err;
        }
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { username } = req.session.user;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        
        const result = await User.changePassword(username, oldPassword, newPassword);
        res.status(200).json({ message: result.message });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        // Clear remember me token if user is logged in
        if (req.session.user && req.session.user.id) {
            await User.clearRememberToken(req.session.user.id);
        }
        
        // Clear the remember_token cookie
        res.clearCookie('remember_token', {
            httpOnly: true,
            secure: process.env.STATUS === 'production',
            path: '/'
        });
        
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all users with filtering, searching, and sorting
exports.getAllUsers = async (req, res) => {
    try {
        const filters = {
            country: req.query.country,
            role: req.query.role,
            status: req.query.status,
            search: req.query.search,
            sortBy: req.query.sortBy || 'created_at',
            sortOrder: req.query.sortOrder || 'DESC',
            limit: req.query.limit,
            offset: req.query.offset
        };
        
        const result = await User.get_all_users(filters);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user counts by status
exports.getUserCounts = async (req, res) => {
    try {
        const filters = {
            country: req.query.country,
            role: req.query.role,
            search: req.query.search
        };
        
        const counts = await User.getUserCounts(filters);
        res.status(200).json(counts);
    } catch (err) {
        console.error('Error fetching user counts:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Change password for user
exports.changePasswordUser = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!userId || !oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }
        const result = await User.changePasswordUser(userId, newPassword);
        res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Error changing password for user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Activate user
exports.activateUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await User.activateUser(userId);
        res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Error activating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Deactivate user
exports.deactivateUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await User.deactivateUser(userId);
        res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Error deactivating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Edit user
exports.edit_user = async (req, res) => {
    try {
        const { userId, username, fullName, phoneNumber, email, country, role, address, postcode, city, state } = req.body;
        const result = await User.edit_user(userId, username, fullName, phoneNumber, email, country, role, address, postcode, city, state);
        res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await User.deleteUser(userId);
        res.status(200).json({ message: result.message });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}