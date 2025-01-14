import connection from "../../config/connection.js";
import handleError from '../../helpers/handleError.js';
const { pool } = connection;


export const getAllBorrowers = async (branch) => {

    try {

        const query = `
          SELECT id, first_name , last_name  FROM borrowers WHERE branch_id = ? and deleted_at is null
        `
        const [rows] = await pool.query(query, [branch])

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        handleError(error , "Api Error Fetching Borrower")

    }

}