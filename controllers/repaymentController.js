import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;


export const getAllRepayments = async (branch) => {

    try {

        const query = `
            SELECT loan_repayments.id as loanrepayment_id, loan_repayments.amount , loan_repayments.collection_date , users.first_name as user_firstname , users.last_name as user_lastname , borrowers.first_name as borrower_firstname , borrowers.last_name as borrower_lastname , loan_repayment_methods.name as repayment_method
FROM loan_repayments
JOIN users on loan_repayments.user_id = users.id
JOIN borrowers on loan_repayments.borrower_id = borrowers.id
JOIN loan_repayment_methods on loan_repayments.repayment_method_id = loan_repayment_methods.id
WHERE loan_repayments.deleted_at is null AND loan_repayments.branch_id = ?
        `

        let [rows] = await pool.query(query, [branch])

        return { queryStatus: true, data: rows };

    }catch (error) {

        console.log(error)
        return handleError(error, 'Fetching Repayments Failed');

    }
}


export const insertRepayment = async (loan_id, borrower, user, 
            repayment_amount, repayment_method, repayment_date, notes, branch ) => {

    try {


        let currentTime = new Date()

        const query = `
            INSERT INTO loan_repayments (loan_id, borrower_id, user_id, amount, repayment_method_id, collection_date,
                notes, due_date, created_at, updated_at, branch_id)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)
        `

        await pool.query(query, [loan_id, borrower, user, repayment_amount, repayment_method, repayment_date, notes,
                repayment_date, currentTime, currentTime, branch
        ])

        return {
            queryStatus : true
        }

    }catch (error) {

        console.log(error)
        return handleError(error, 'Creating Loan Repayment');

    }
 }

