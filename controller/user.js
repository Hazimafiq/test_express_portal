const User = require('../model/User');
const CustomError = require('../errors/CustomError');

// Register user
exports.register = async (req, res) => {
    try {
        const { username, fullName, phoneNumber, email, clinic, country, password, confirmPassword, role } = req.body;
        if (!username || !password || !confirmPassword || !role || !fullName || !phoneNumber || !email || !country || !clinic) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const user = await User.register(req.body);
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
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User.login(username, password);
        req.session.user = user;
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
        const { id } = req.query;
        const user = await User.get_profile_data(id);
        res.status(200).json({ user });
    } catch (err) {
        if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ message: err.message });
        } else {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
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
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'Logged out successfully' });
    });
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
        const { userId, username, fullName, phoneNumber, email, country, role } = req.body;
        const result = await User.edit_user(userId, username, fullName, phoneNumber, email, country, role);
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