import connection from '../config/connection.js';
import  handleError  from '../helpers/handleError.js';

const { pool } = connection;

// Fetch due loans
export const getArrearsLoans = async () => {
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
            HAVING 
                missed_amount > 0
        `;

        const [rows] = await pool.query(query);
        return {
            queryStatus: true,
            message: "success",
            data: rows
        };
    } catch (error) {
        return handleError(error, "fetching due loans");
    }
};

export const getAllLoans = async () => {
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
                loans.deleted_at IS NULL;
        `;
        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, 'fetching loan details with maturity check');
    }
};


