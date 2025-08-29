// Don't import User model at the top level
// We'll import it inside the middleware function to ensure environment variables are loaded first

// Authentication middleware
exports.requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// API authentication middleware (returns JSON instead of redirect)
exports.requireAuthAPI = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};


/**
 * Middleware to check for "Remember Me" token and automatically log in the user
 * if a valid token is found and the user is not already logged in
 */
exports.rememberMeMiddleware = async (req, res, next) => {
    try {
        // console.log('=== Remember Me Middleware ===');
        // console.log('Path:', req.path);
        // console.log('Cookies:', req.cookies);
        // console.log('Session:', req.session ? 'exists' : 'not exists');
        // console.log('User in session:', req.session && req.session.user ? 'yes' : 'no');
        
        // Skip if user is already logged in
        if (req.session && req.session.user) {
            
            // If user is already logged in and accessing the root or login page, redirect to aligners-cases
            if ((req.path === '/' || req.path === '/login') && req.method === 'GET') {
                return res.redirect('/aligners-cases');
            }
            
            return next();
        }

        // Check for remember_token cookie
        const token = req.cookies.remember_token;
        if (!token) {
            return next();
        }
        
        // Import User model here to ensure environment variables are loaded
        const User = require('../model/User');
        
        const user = await User.validateRememberToken(token);
        
        if (!user) {
            res.clearCookie('remember_token', {
                httpOnly: true,
                secure: process.env.STATUS === 'production',
                path: '/',
                sameSite: 'lax'
            });
            return next();
        }

        // Auto login the user
        req.session.user = user;
        res.locals.user = [user];
        res.locals.currentUser = user;
        
        // Extend the session to 30 days since this is a remember me login
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        const { token: newToken, expiresAt } = await User.generateRememberToken(user.id);
        
        // If this is a request to the root or login page, redirect to aligners-cases
        if ((req.path === '/' || req.path === '/login') && req.method === 'GET') {
            
            res.cookie('remember_token', newToken, {
                httpOnly: true,
                secure: process.env.STATUS === 'production',
                expires: expiresAt,
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
            });
            
            return res.redirect('/aligners-cases');
        }
        
        // Set the new token
        res.cookie('remember_token', newToken, {
            httpOnly: true,
            secure: process.env.STATUS === 'production',
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds (backup to expires)
        });

        next();
    } catch (error) {
        console.error('Remember me middleware error:', error);
        next();
    }
};
