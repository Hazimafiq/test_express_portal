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
        const query = 'SELECT username, phoneNumber, email, role, country FROM users WHERE id = ? LIMIT 1';
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
}

module.exports = User;
