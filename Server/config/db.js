const mysql = require('mysql2');

const dbConfig = {
    host: 'localhost',
    port: 8889,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;