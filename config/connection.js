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

// Custom wrapper for connection events
// const trackConnection = async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connection opened: ', connection.threadId); // Log connection opened

//         // Override the release method to track when connections are released
//         const originalRelease = connection.release;
//         connection.release = () => {
//             console.log('Connection closed: ', connection.threadId); // Log connection closed
//             return originalRelease.call(connection);
//         };

//         return connection;
//     } catch (error) {
//         console.error('Error acquiring connection:', error);
//         throw error;
//     }
// };

// Test the connection with tracking
// (async () => {
//     try {
//         const connection = await trackConnection();
//         // Use the connection here (e.g., a query)
//         console.log('Testing query...');
//         await connection.query('SELCT 1'); // Example query
//         connection.release(); // Release the connection
//     } catch (error) {
//         console.error(error.message);
//         console.error(error.stack);
//     }
// })();

export default { pool };
