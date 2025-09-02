const mysql = require('mysql2/promise');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: true,
    supportBigNumbers: true,
    dateStrings: true,
    charset: 'utf8mb4',
    connectionLimit: 100,
    waitForConnections: true,
});

module.exports = pool;
