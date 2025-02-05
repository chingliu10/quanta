import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all payroll entries
export const storeIncomeType = async (income_type) => {


    try {

        let timeStamp = new Date()

        const query = `
           INSERT INTO other_income_types
            (name, created_at, updated_at) values (?, ?, ?)
        `;

        await pool.query(query, [income_type.toUpperCase(), timeStamp , timeStamp ])

        return { queryStatus: true }

    } catch (error) {

        return handleError(error, 'Failed To Create Income Type/c');

    }

};