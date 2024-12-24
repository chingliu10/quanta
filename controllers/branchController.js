import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all branches
export const getBranches = async () => {
    try {
        const query = `
            SELECT 
                b.id AS branch_id,
                b.name AS branch_name,
                COUNT(bu.id) AS user_count,
                b.notes AS branch_notes
            FROM 
                branches b
            LEFT JOIN 
                branch_users bu ON b.id = bu.branch_id
            GROUP BY 
                b.id
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'Branches retrieved successfully.' };
    } catch (error) {
        return handleError(error, 'fetching branches');
    }
};
