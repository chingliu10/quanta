import connection from '../config/connection.js';
import  handleError  from '../helpers/handleError.js';

const { pool } = connection;

// Fetch due loans
export const getArrearsLoans = async (branch) => {
    try {
        const query = `
            SELECT 
                borrowers.first_name AS first_name,
                borrowers.last_name AS last_name,
                COALESCE(due_totals.total_due, 0) AS total_due,
                COALESCE(paid_totals.total_paid, 0) AS total_paid,
                (COALESCE(due_totals.total_due, 0) - COALESCE(paid_totals.total_paid, 0)) AS missed_amount,
                loans.id as loan_id
            FROM 
                loans
            JOIN 
                borrowers 
                ON borrowers.id = loans.borrower_id
            LEFT JOIN 
                (
                    SELECT 
                        loan_id,
                        SUM(due) AS total_due
                    FROM 
                        loan_schedules
                    WHERE 
                        deleted_at IS NULL
                        AND due_date < CURDATE()
                    GROUP BY 
                        loan_id
                ) AS due_totals 
                ON loans.id = due_totals.loan_id
            LEFT JOIN 
                (
                    SELECT 
                        loan_id,
                        SUM(amount) AS total_paid
                    FROM 
                        loan_repayments
                    WHERE 
                        deleted_at IS NULL
                        AND collection_date < CURDATE()
                    GROUP BY 
                        loan_id
                ) AS paid_totals 
                ON loans.id = paid_totals.loan_id
            WHERE 
                loans.status <> 'closed'
                AND loans.deleted_at IS NULL 
                AND loans.branch_id = ?
            HAVING 
                missed_amount > 0
        `;

        const [rows] = await pool.query(query, [branch]);
        return {
            queryStatus: true,
            message: "success",
            data: rows
        };
    } catch (error) {
        return handleError(error, "Fetching Due Loans Failed");
    }
};

export const getAllLoans = async (branch) => {
    try {
        const query = `
            SELECT 
                borrowers.first_name AS first_name,
                borrowers.last_name AS last_name,
                loans.id AS loan_id,
                loans.principal AS principal,
                loans.release_date AS release_date,
                loans.maturity_date AS maturity_date,
                loans.interest_rate AS interest_rate,
                COALESCE(due_totals.total_due, 0) AS total_due,
                COALESCE(paid_totals.total_paid, 0) AS total_paid,
                (COALESCE(due_totals.total_due, 0) - COALESCE(paid_totals.total_paid, 0)) AS balance,
                CASE
                    WHEN loans.maturity_date < CURDATE() AND (COALESCE(due_totals.total_due, 0) - COALESCE(paid_totals.total_paid, 0)) > 0 THEN 'Past Maturity'
                    ELSE loans.status
                END AS status
            FROM 
                loans
            JOIN 
                borrowers 
                ON borrowers.id = loans.borrower_id
            LEFT JOIN 
                (
                    SELECT 
                        loan_id,
                        SUM(due + fees) AS total_due
                    FROM 
                        loan_schedules
                    WHERE 
                        deleted_at IS NULL
                    GROUP BY 
                        loan_id
                ) AS due_totals 
                ON loans.id = due_totals.loan_id
            LEFT JOIN 
                (
                    SELECT 
                        loan_id,
                        SUM(amount) AS total_paid
                    FROM 
                        loan_repayments
                    WHERE 
                        deleted_at IS NULL
                    GROUP BY 
                        loan_id
                ) AS paid_totals 
                ON loans.id = paid_totals.loan_id
            WHERE 
                loans.deleted_at IS NULL
                and loans.branch_id = ?
        `;
        const [rows] = await pool.query(query, [branch]);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        console.log(error)
        return handleError(error, 'fetching loan details with maturity check');
    }
};


export const getPendingLoans = async (branch) => {

    try {

        const query = `
          select loans.id as loan_id , loans.principal , loans.release_date,
   loans.interest_rate , loans.interest_method, loans.interest_period , 
	  loans.loan_duration, loans.loan_duration_type, 
		borrowers.first_name , borrowers.last_name	from loans join borrowers on loans.borrower_id = borrowers.id
	where loans.status = 'pending' and loans.deleted_at is null and borrowers.deleted_at is null
		and loans.branch_id = ?;
        `
        const [rows] = await pool.query(query, [branch])

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error)  {

        return handleError(error, 'Fetching Pending Loans Failed');

    }

}


export const createLoanProduct = async ({
    productName, 
    defaultPrincipal,
    minPrincipal,
    maxPrincipal,
    interestMethod,
    interestPeriod,
    defaultInterest,
    minInterest,
    maxInterest,
    defaultDuration,
    durationType,
    repaymentCycle
}) => {

    try {

        //check if there is a name
        const checkIfProductExist = `
            SELECT name from loan_products where name = ? and deleted_at is null limit 1;
        `

        let [rows] = await pool.query(checkIfProductExist, [productName])

        if(rows.length > 0){

            return {
                queryStatus : true,
                message : "found"
            }

        } 

        let insertQuery = `
            INSERT INTO loan_products (name, minimum_principal, default_principal, maximum_principal , interest_method,
                interest_period, default_interest_rate, minimum_interest_rate, maximum_interest_rate, default_loan_duration,
                    default_loan_duration_type, repayment_cycle
                ) values (?,?,?,?,?,?,?,?,?,?,?,?)
        `

        let [rows2] = await pool.query(insertQuery, [  
         productName.toUpperCase() , minPrincipal, defaultPrincipal, maxPrincipal, interestMethod, interestPeriod,
            defaultInterest,
            minInterest,
            maxInterest,
            defaultDuration,
            durationType,
            repaymentCycle])

        
        return {
            queryStatus : true,
            message : "done"
        }

    }catch (error) {

        console.log(error)
        return handleError(error, 'Failed To Create Loan Product');

    }

}


export const getAllLoansProducts = async () => {
    try {

        let query = `
            select id, name, minimum_principal, default_principal, maximum_principal , interest_method,
                interest_period, default_interest_rate, minimum_interest_rate, maximum_interest_rate, default_loan_duration,
                    default_loan_duration_type, repayment_cycle from loan_products where deleted_at is null
        `
        let [rows] = await pool.query(query)

        return {
            queryStatus : true,
            data : rows
        }


    }catch (error){

        return handleError(error, 'Failed To Get Loan Products');

    }
}


export const getBorrowerDetails = async (borrowerId) => {

    try {

        let query = `
            select id, first_name , last_name from borrowers where id = ? and deleted_at is null limit 1
        `

        let [rows] = await pool.query(query, [borrowerId])

        
        return {
            queryStatus : true,
            data : rows
        }


    }catch (error) {

        return handleError(error, "Failed To Get Borrower")
    }

}


export const getAllBorrowers = async () => {

    try {

        let query = `
            SELECT id, first_name, last_name from borrowers where deleted_at is null
        `

        let [rows] = await pool.query(query)

        return {
            queryStatus : true,
            data : rows
        }

    }catch (error) {

        return handleError(error, "Failed To Get Borrowers")

    }

}


export const insertPendingLoan = async (user, branch , {
  borrowerId,
  loanProductId,
  principalAmount,
  releaseDate,
  interestMethod,
  interestRate,
  interestPeriod,
  duration,
  durationType,
  repaymentCycle,
}) => {

    try {

        let currentTimeStamp = new Date()

        if(interestMethod == "flat_rate") {

                    
                const query = `
                insert into loans (user_id, borrower_id, loan_product_id, release_date, principal, interest_method, interest_rate,
                interest_period, loan_duration, loan_duration_type, repayment_cycle, loan_status, created_at, updated_at, status, branch_id)
                values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `

             await   pool.query(query, [
                    user,
                    borrowerId,
                    loanProductId,
                    releaseDate,
                    principalAmount,
                    interestMethod,
                    interestRate,
                    interestPeriod,
                    duration,
                    durationType,
                    repaymentCycle,
                    'open',
                    currentTimeStamp,
                    currentTimeStamp,
                    "pending",
                    branch
                ])

        }

        return {
            queryStatus : true,
            message : "done"
        }

    }catch(error) {


        return handleError(error, "Failed To Add Loan")

    }

}

