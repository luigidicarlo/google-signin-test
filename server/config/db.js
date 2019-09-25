const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'host',
    user: 'user',
    password: 'pass',
    database: 'database'
});

module.exports = pool;
