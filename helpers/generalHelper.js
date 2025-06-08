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


 
 export const totalSavingsWithdrawn = async (starting_date, end_date, branch) => {


    try {

        let query 

        if(starting_date && end_date) {


            let query = `
                SELECT  coalesce(SUM(amount), 0) AS savings_withdrawn FROM savings_transactions
             WHERE type = 'withdrawal' AND date between ? and ? AND deleted_at IS NULL AND branch_id = ? 
            `

            let [rows] = await pool.query(query, [starting_date, end_date,  branch])

            console.log(rows)

            return {
                queryStatus : true,
                data : parseInt(rows[0].savings_withdrawn)
            }

        }

            query = `
                 SELECT  coalesce(SUM(amount), 0) AS savings_withdrawn FROM savings_transactions
             WHERE type = 'withdrawal' AND deleted_at IS NULL AND branch_id = ?
            `

            let [rows] = await pool.query(query, [branch])

            return {
                queryStatus : true,
                data : parseInt(rows[0].savings_withdrawn)
            }

    }catch (error) {

            console.log(error)
            return handleError(error, "Failed To Get Total Savings Withdrawn/Api")

    }

 }


export const getTotalPayroll = async (starting_date, end_date, branch) => {
    try {
        let query;
        let rows;

        if (starting_date && end_date) {
            query = `
                SELECT COALESCE(SUM(paid_amount), 0) AS total_payroll 
                FROM payroll 
                WHERE deleted_at IS NULL 
                AND date BETWEEN ? AND ? 
                AND branch_id = ?
            `;
            [rows] = await pool.query(query, [starting_date, end_date, branch]);
        } else {
            query = `
                SELECT COALESCE(SUM(paid_amount), 0) AS total_payroll 
                FROM payroll 
                WHERE deleted_at IS NULL 
                AND branch_id = ?
            `;
            [rows] = await pool.query(query, [branch]);
        }

        return {
            queryStatus: true,
            data: parseInt(rows[0].total_payroll),
        };
    } catch (error) {
        console.log(error);
        return handleError(error, "Failed To Get Total Payroll/Api");
    }
};

export const getTotalIncome = async (starting_date, end_date, branch) => {
    try {
        let query;
        let rows;

        if (starting_date && end_date) {
            query = `
                SELECT COALESCE(SUM(amount), 0) AS total_income 
                FROM other_income 
                WHERE deleted_at IS NULL 
                AND created_at BETWEEN ? AND ? 
                AND branch_id = ?
            `;
            [rows] = await pool.query(query, [starting_date, end_date, branch]);
        } else {
            query = `
                SELECT COALESCE(SUM(amount), 0) AS total_income 
                FROM other_income 
                WHERE deleted_at IS NULL 
                AND branch_id = ?
            `;
            [rows] = await pool.query(query, [branch]);
        }

        return {
            queryStatus: true,
            data: parseInt(rows[0].total_income),
        };
    } catch (error) {
        console.log(error);
        return handleError(error, "Failed To Get Total Income/Api");
    }
};



export const calculateLoanSchedule = async ({

    id ,
    borrower_id,
    branch_id,
    approved_amount,
    first_payment_date,
    interest_method,
    interest_period,
    interest_rate,
    loan_duration

}) => {


    try {

       


        let { principalPerPayment , interestPerPayment } = getPrincipalAndInterestPerPayment(
            approved_amount,
            loan_duration,
            interest_period,
            interest_rate )

        let remainingPrincipal = approved_amount, 
            firstRepaymentDate = first_payment_date  

        let currentTimeStamp = new Date()
        let currentDate = new Date(firstRepaymentDate);

        for (let i = 0; i < loan_duration; i++) {


                const principal = Number(principalPerPayment.toFixed(2));
                const interest = Number(interestPerPayment.toFixed(2));
                const fees =  0; // Initial fees for first payment
                const penalty = 0
                const due = principal + interest + fees;
                

                remainingPrincipal -= principal;

                let query = `
                    insert into loan_schedules (loan_id, borrower_id, description, due_date, principal, principal_balance,interest, fees, 
                    penalty, due, created_at, updated_at, branch_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)
                `

                await pool.query(query, [id, borrower_id, 'repayment', currentDate.toISOString().split('T')[0] ,  principal, remainingPrincipal , interest , fees, penalty, due, currentTimeStamp, currentTimeStamp, branch_id ])

                currentDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        
        }

        return {
            queryStatus : true
        }


    }catch (e) {

        console.log(e)

        return {
            queryStatus : false
        }

    }

}


function getPrincipalAndInterestPerPayment (approved_amount,
        loan_duration,
        interest_period,
        interest_rate) {

    let principalPerPayment , interestPerPayment

    principalPerPayment = approved_amount / loan_duration

    if(interest_period === 'week') {
        const totalInterest = approved_amount * (interest_rate / 100)
        interestPerPayment = totalInterest / loan_duration
    } else if (interest_period === 'month') {
        // For monthly interest (convert to weekly)
        const monthlyInterest = approved_amount * ( interest_rate / 100);
        interestPerPayment = monthlyInterest / 4; // Divide by 4 for weekly payments
     }

     return { principalPerPayment , interestPerPayment }


}

