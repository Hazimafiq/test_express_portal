const argon2 = require('argon2');
const crypto = require('crypto');
const pool = require('../utils/mysql');
const CustomError = require('../errors/CustomError');

class User {
    static async register({ username, password, fullName, phoneNumber, email, clinic, address, country, role, postcode, city, state }) {
        // Check for existing username
        const existingUsernameQuery = 'SELECT * FROM users_table WHERE username = ?';
        const existingUsernameValues = [username];
        const [existingUsernames] = await pool.query(existingUsernameQuery, existingUsernameValues);
        if (existingUsernames.length > 0) {
            throw new CustomError('Username already exists', 400);
        }
        
        // Check for existing email
        const existingEmailQuery = 'SELECT * FROM users_table WHERE email = ?';
        const existingEmailValues = [email];
        const [existingEmails] = await pool.query(existingEmailQuery, existingEmailValues);
        if (existingEmails.length > 0) {
            throw new CustomError('Email already exists', 400);
        }
        const hashedPassword = await argon2.hash(password);
        const query = 'INSERT INTO users_table (username, password, fullName, phoneNumber, email, clinic, country, role, address, postcode, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [
            username.trim(), 
            hashedPassword, 
            fullName.trim(), 
            phoneNumber.trim(), 
            email.trim(), 
            clinic.trim(), 
            country.trim(), 
            role.trim(), 
            address ? address.trim() : null, 
            postcode ? postcode.trim() : null, 
            city ? city.trim() : null, 
            state ? state.trim() : null
        ];
        const [results] = await pool.query(query, values);
        return {results, message: 'User created.'};
    }

    static async login(username, password) {
        const query = 'SELECT * FROM users_table WHERE username = ? LIMIT 1';
        const values = [username];
        const [results] = await pool.query(query, values);
        const user = results[0];
        if (!user || !(await argon2.verify(user.password, password))) {
            throw new CustomError('Invalid credentials', 401);
        }
        
        const updateLoginQuery = 'UPDATE users_table SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(updateLoginQuery, [user.id]);
        
        return user;
    }
    
    static async generateRememberToken(userId) {
        const token = crypto.randomBytes(64).toString('hex');
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        const query = 'UPDATE users_table SET remember_token = ?, token_expires_at = ? WHERE id = ?';
        const values = [token, expiresAt, userId];
        await pool.query(query, values);
        
        return { token, expiresAt };
    }
    
    static async validateRememberToken(token) {
        if (!token) return null;
        
        const query = 'SELECT * FROM users_table WHERE remember_token = ? AND token_expires_at > NOW() LIMIT 1';
        const values = [token];

        try {
            const [results] = await pool.query(query, values);
            
            if (results.length === 0) {
                
                // Debug: Check if token exists but is expired
                const checkExpiredQuery = 'SELECT * FROM users_table WHERE remember_token = ? LIMIT 1';
                const [expiredResults] = await pool.query(checkExpiredQuery, [token]);
                if (expiredResults.length > 0) {
                    console.log('Token exists but expired. Expiry date:', expiredResults[0].token_expires_at);
                    console.log('Current server time:', new Date());
                }
                
                return null;
            }
            
            return results[0];
        } catch (error) {
            console.error('Error validating remember token:', error);
            return null;
        }
    }
    
    static async clearRememberToken(userId) {
        const query = 'UPDATE users_table SET remember_token = NULL, token_expires_at = NULL WHERE id = ?';
        const values = [userId];
        await pool.query(query, values);
        
        return { message: 'Remember token cleared' };
    }

    static async changePassword(username, oldPassword, newPassword) {
        const user = await this.login(username, oldPassword);
        const hashedNewPassword = await argon2.hash(newPassword);
        const query = 'UPDATE users_table SET password = ? WHERE id = ?';
        const values = [hashedNewPassword, user.id];
        await pool.query(query, values);
        return { message: 'Password changed.' };
    }

    static async changePasswordUser(userId, newPassword) {
        const hashedNewPassword = await argon2.hash(newPassword);
        const query = 'UPDATE users_table SET password = ? WHERE id = ?';
        const values = [hashedNewPassword, userId];
        await pool.query(query, values);
        return { message: 'Password changed.' };
    }

    static async get_profile_data(id) {
        const query = 'SELECT id, fullName, username, phoneNumber, email, role, country, clinic, status, address, postcode, city, state FROM users_table WHERE id = ? LIMIT 1';
        const values = [id];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No User Found', 401)
        }
        return results;
    }

    static async edit_user(userId, username, fullName, phoneNumber, email, country, role, address, postcode, city, state ) {
        const query = 'UPDATE users_table SET username = ?, fullName = ?, phoneNumber = ?, email = ?, country = ?, role = ?, address = ?, postcode = ?, city = ?, state = ? WHERE id = ? LIMIT 1';
        const values = [username, fullName, phoneNumber, email, country, role, address, postcode, city, state, userId];
        const [results] = await pool.query(query, values);
        return {results, message: 'Profile updated.'};
    }

    static async get_all_users(filters = {}) {
        const { country, role, status, search, sortBy = 'created_at', sortOrder = 'DESC', limit, offset } = filters;
        
        let query = 'SELECT id, fullName, username, phoneNumber, email, role, country, clinic, status, created_at, last_login FROM users_table';
        let whereConditions = ['deleted_at IS NULL'];
        let queryParams = [];
        
        // Add country filter
        if (country && country.trim() !== '') {
            whereConditions.push('country = ?');
            queryParams.push(country.trim());
        }
        
        // Add role filter
        if (role && role.trim() !== '') {
            whereConditions.push('role = ?');
            queryParams.push(role.trim());
        }
        
        // Add status filter
        if (status && status.trim() !== '' && status !== 'all') {
            whereConditions.push('status = ?');
            queryParams.push(status.trim());
        }
        
        // Add search filter (searches in fullName, username, and email)
        if (search && search.trim() !== '') {
            whereConditions.push('(fullName LIKE ? OR username LIKE ? OR email LIKE ?)');
            const searchPattern = `%${search.trim()}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }
        
        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        // Add sorting
        const validSortColumns = ['created_at', 'last_login', 'fullName', 'username', 'country', 'role'];
        const validSortOrders = ['ASC', 'DESC'];
        
        if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
            query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
        } else {
            query += ' ORDER BY created_at DESC'; // Default sorting
        }
        
        // Add pagination
        if (limit && Number.isInteger(parseInt(limit)) && parseInt(limit) > 0) {
            query += ' LIMIT ?';
            queryParams.push(parseInt(limit));
            
            if (offset && Number.isInteger(parseInt(offset)) && parseInt(offset) >= 0) {
                query += ' OFFSET ?';
                queryParams.push(parseInt(offset));
            }
        }
        
        const [results] = await pool.query(query, queryParams);
        
        // Get total count for pagination (without limit/offset)
        let countQuery = 'SELECT COUNT(*) as total FROM users_table';
        let countParams = [];
        
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
            // For count query, we only need the filter parameters, not limit/offset
            let paramCount = 0;
            if (country && country.trim() !== '') paramCount++;
            if (role && role.trim() !== '') paramCount++;
            if (status && status.trim() !== '' && status !== 'all') paramCount++;
            if (search && search.trim() !== '') paramCount += 3; // search uses 3 parameters
            
            countParams = queryParams.slice(0, paramCount);
        }
        
        const [countResults] = await pool.query(countQuery, countParams);
        const total = countResults[0].total;
        
        return {
            users: results,
            total: total,
            count: results.length
        };
    }

    static async getUserCounts(filters = {}) {
        const { country, role, search } = filters;
        
        let baseQuery = 'SELECT status, COUNT(*) as count FROM users_table';
        let whereConditions = ['deleted_at IS NULL'];
        let queryParams = [];
        
        // Add country filter
        if (country && country.trim() !== '') {
            whereConditions.push('country = ?');
            queryParams.push(country.trim());
        }
        
        // Add role filter
        if (role && role.trim() !== '') {
            whereConditions.push('role = ?');
            queryParams.push(role.trim());
        }
        
        // Add search filter (searches in fullName, username, and email)
        if (search && search.trim() !== '') {
            whereConditions.push('(fullName LIKE ? OR username LIKE ? OR email LIKE ?)');
            const searchPattern = `%${search.trim()}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }
        
        // Add WHERE clause if there are conditions
        if (whereConditions.length > 0) {
            baseQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        
        baseQuery += ' GROUP BY status';
        
        const [results] = await pool.query(baseQuery, queryParams);
        
        // Also get total count
        let totalQuery = 'SELECT COUNT(*) as total FROM users_table';
        if (whereConditions.length > 0) {
            totalQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        const [totalResults] = await pool.query(totalQuery, queryParams);
        
        // Format the results
        const counts = {
            all: totalResults[0].total,
            active: 0,
            inactive: 0
        };
        
        results.forEach(row => {
            counts[row.status] = row.count;
        });
        
        return counts;
    }

    static async activateUser(userId) {
        const query = 'UPDATE users_table SET status = "active" WHERE id = ?';
        const values = [userId];
        await pool.query(query, values);
        return { message: 'User account has been activated.' };
    }

    static async deactivateUser(userId) {
        const query = 'UPDATE users_table SET status = "inactive" WHERE id = ?';
        const values = [userId];
        await pool.query(query, values);
        return { message: 'User account has been deactivated.' };
    }

    static async deleteUser(userId) {
        const query = 'UPDATE users_table SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const values = [userId];
        await pool.query(query, values);
        return { message: 'User deleted.' };
    }
}

module.exports = User;
