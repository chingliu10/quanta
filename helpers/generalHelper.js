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


export const totalPrincipalReleased = async (starting_date, end_date, branch) => { 

    try {

        let query 

        if(starting_date && end_date) {


            let query = `
                select COALESCE(sum(principal), 0) as total_principal from loans where release_date 
                    between ? and ? and  deleted_at is null and branch_id = ?
            `

            let [rows] = await pool.query(query, [starting_date, end_date,  branch])

            console.log(rows)

            return {
                queryStatus : true,
                data : parseInt(rows[0].total_principal)
            }

        }

            query = `
                select COALESCE(sum(principal), 0) as total_principal from loans where deleted_at is null and branch_id = ?
            `

            let [rows] = await pool.query(query, [branch])

            return {
                queryStatus : true,
                data : parseInt(rows[0].total_principal)
            }

    }catch (error) {

            console.log(error)
            return handleError(error, "Failed To Get Total Principal Released/Api")

    }

 }


 export const totalSavingsDeposits = async (starting_date, end_date, branch) => {


    try {

        let query 

        if(starting_date && end_date) {


            let query = `
                SELECT  coalesce(SUM(amount), 0) AS savings_deposited FROM savings_transactions
             WHERE type = 'deposit' AND date between ? and ? AND deleted_at IS NULL AND branch_id = ? 
            `

            let [rows] = await pool.query(query, [starting_date, end_date,  branch])

            console.log(rows)

            return {
                queryStatus : true,
                data : parseInt(rows[0].savings_deposited)
            }

        }

            query = `
                 SELECT  coalesce(SUM(amount), 0) AS savings_deposited FROM savings_transactions
             WHERE type = 'deposit' AND deleted_at IS NULL AND branch_id = ?
            `

            let [rows] = await pool.query(query, [branch])

            return {
                queryStatus : true,
                data : parseInt(rows[0].savings_deposited)
            }

    }catch (error) {

            console.log(error)
            return handleError(error, "Failed To Get Total Savings Deposited/Api")

    }

 }
