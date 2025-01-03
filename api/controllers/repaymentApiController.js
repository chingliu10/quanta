import connection from "../../config/connection.js";
import handleError from '../../helpers/handleError.js';
const { pool } = connection;


export const getBorrowerRepayments = async (borrower) => {

    try {

        const query = `
          select loan_repayments.id as transaction_id , loan_repayments.borrower_id as borrower_id , 
            loan_repayments.collection_date as collection_date , loan_repayments.amount as amount,
            users.first_name 	, users.last_name  from loan_repayments 
                join users on loan_repayments.user_id = users.id
                    where loan_repayments.deleted_at is null
                        and loan_repayments.borrower_id = ?
 
        `
        const [rows] = await pool.query(query, [borrower])

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        handleError(error , "Api Error Fetching Borrower Repayments")

    }

}