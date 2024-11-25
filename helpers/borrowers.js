// borrowers.js
import { pool } from './database/connection.js';

export const getTotalBorrowersByBranch = async (branchId) => {
    try {
        // Fetch borrowers for the given branchId
        const [rows] = await pool.query('SELECT * FROM borrowers WHERE branch_id = ?', [branchId]);
        return rows; // Return the borrowers
    } catch (error) {
        console.error('Error fetching borrowers:', error);
        throw error; // Propagate the error for handling by the caller
    }
};
