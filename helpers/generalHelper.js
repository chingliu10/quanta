import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;
// Fetch details of a specific branch by ID
export const getAllUsers = async (branchId) => {
    try {
        const query = `
            SELECT 
                id,
                first_name ,
                last_name,
                phone,
                email
              FROM USERS
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'Users Retrieved Successfully.' };
    } catch (error) {
        return handleError(error, 'Failed To Get Branches');
    }
};