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

export const getTotalCapital = async (starting_date, end_date, branch) => {

    console.log(branch)

    try {

        let query 

        if(starting_date && end_date) {

            query = `select  COALESCE(sum(amount), 0) as total_capital from capital where deleted_at is null and 
                created_at between ? and ? and branch_id = ?`
            
            let [rows] = await pool.query(query, [starting_date, end_date, branch])

            console.log(rows)

            return {
                queryStatus : true,
                data : parseInt(rows[0].total_capital)
            }

        }

            

            query = `select  COALESCE(sum(amount), 0) as total_capital from capital where deleted_at is null and branch_id = ?`

            let [rows] = await pool.query(query, [branch])

            console.log(rows)

            return {
                queryStatus : true,
                data : parseInt(rows[0].total_capital)
            }

    }catch (error) {

            return handleError(error, "Failed To Get Total Capital/Api")

    }
}

