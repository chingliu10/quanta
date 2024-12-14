import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all savings accounts
export const getSavingsAccounts = async () => {
    try {
        const query = `
            SELECT 
                borrowers.first_name AS first_name,
                borrowers.last_name AS last_name,
                savings.id AS savings_id,
                savings_products.name AS product,
                COALESCE(SUM(CASE WHEN savings_transactions.type = 'deposit' THEN savings_transactions.amount ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN savings_transactions.type = 'withdrawal' THEN savings_transactions.amount ELSE 0 END), 0) AS balance
            FROM 
                savings
            JOIN 
                borrowers ON borrowers.id = savings.borrower_id
            JOIN 
                savings_products ON savings_products.id = savings.savings_product_id
            LEFT JOIN 
                savings_transactions ON savings_transactions.savings_id = savings.id
            WHERE 
                savings.deleted_at IS NULL
            GROUP BY 
                savings.id, borrowers.id, savings_products.name;
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, 'fetching savings accounts');
    }
};
