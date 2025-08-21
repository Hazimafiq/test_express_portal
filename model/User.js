const argon2 = require('argon2');
const pool = require('../utils/mysql');
const CustomError = require('../errors/CustomError');

class User {
    static async register({ username, password, fullName, phoneNumber, email, clinic, country, role }) {
        const existingUserQuery = 'SELECT * FROM users WHERE username = ?';
        const existingUserValues = [username];
        const [existingUsers] = await pool.query(existingUserQuery, existingUserValues);
        if (existingUsers.length > 0) {
            throw new CustomError('User already exists', 400);
        }
        const hashedPassword = await argon2.hash(password);
        const query = 'INSERT INTO users (username, password, fullName, phoneNumber, email, clinic, country, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [username.trim(), hashedPassword, fullName.trim(), phoneNumber.trim(), email.trim(), clinic.trim(), country.trim(), role.trim()];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async login(username, password) {
        const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
        const values = [username];
        const [results] = await pool.query(query, values);
        const user = results[0];
        if (!user || !(await argon2.verify(user.password, password))) {
            throw new CustomError('Invalid credentials', 401);
        }
        
        const updateLoginQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.query(updateLoginQuery, [user.id]);
        
        return user;
    }

    static async changePassword(username, oldPassword, newPassword) {
        const user = await this.login(username, oldPassword);
        const hashedNewPassword = await argon2.hash(newPassword);
        const query = 'UPDATE users SET password = ? WHERE id = ?';
        const values = [hashedNewPassword, user.id];
        await pool.query(query, values);
        return { message: 'Password changed successfully' };
    }

    static async get_profile_data(id) {
        // const query = 'SELECT username, phoneNumber, email, role, country, clinic FROM users WHERE id = ? LIMIT 1';
        const query = 'SELECT id, fullName, username, phoneNumber, email, role, country, clinic FROM users WHERE id = ? LIMIT 1';
        const values = [id];
        const [results] = await pool.query(query, values);
        if(results.length == 0){
            throw new CustomError('No User Found', 401)
        }
        return results;
    }

    static async edit(username, fullName, phoneNumber, email, country, role ) {
        const query = 'UPDATE users SET fullName = ?, phoneNumber = ?, email = ?, country = ?, role = ? WHERE username = ? LIMIT 1';
        const values = [fullName, phoneNumber, email, country, role, username];
        const [results] = await pool.query(query, values);
        return results;
    }

    static async get_all_users(filters = {}) {
        const { country, role, search, sortBy = 'created_at', sortOrder = 'DESC', limit, offset } = filters;
        
        let query = 'SELECT id, fullName, username, phoneNumber, email, role, country, clinic, created_at, last_login FROM users';
        let whereConditions = [];
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
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        let countParams = [];
        
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
            // For count query, we only need the filter parameters, not limit/offset
            let paramCount = 0;
            if (country && country.trim() !== '') paramCount++;
            if (role && role.trim() !== '') paramCount++;
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
}

module.exports = User;
