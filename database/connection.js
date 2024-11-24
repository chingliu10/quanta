import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,               // MySQL host from .env
    user: process.env.DB_USER,               // MySQL username from .env
    password: process.env.DB_PASSWORD,       // MySQL password from .env
    database: process.env.DB_NAME,           // MySQL database name from .env
    port: process.env.DB_PORT,               // MySQL port from .env
    waitForConnections: true,                // Ensures queries wait for a connection if all are busy
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10), // Max connections from .env
    queueLimit: 0                            // Unlimited queued requests
});

// Test the connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database');
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error('Database connection failed:', error);
    }
})();

export default pool;
