const User = require('../model/User');
const CustomError = require('../errors/CustomError');

// Register user
exports.register = async (req, res) => {
    try {
        const { username, fulleName, phoneNumber, email, country, password, confirmPassword, role } = req.body;
        if (!username || !password || !confirmPassword || password !== confirmPassword || !role || !fulleName || !phoneNumber || !email || !country) {
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

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { username } = req.session.us·er; // Assume middleware sets req.session.user
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new passwords are required' });
        }
        const message = await User.changePassword(username, oldPassword, newPassword);
        res.status(200).json({ message });
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
