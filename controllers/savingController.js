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

// Get borrowers and savings products for account creation
export const getSavingsForm = async () => {
    try {
        const borrowerQuery = `SELECT id, first_name, last_name FROM borrowers WHERE deleted_at IS NULL`;
        const productQuery = `SELECT id, name FROM savings_products WHERE deleted_at IS NULL`;

        const [borrowers] = await pool.query(borrowerQuery);
        const [savingsProducts] = await pool.query(productQuery);

        return {
            queryStatus: true,
            data: { borrowers, savingsProducts },
            message: 'success',
        };
    } catch (error) {
        return handleError(error, 'fetching borrowers and savings products for form');
    }
};


// Store a new savings account
export const storeSavingsAccount = async (data) => {
    try {
        const { borrower_id, savings_product_id, notes } = data;

        // Check if the borrower already has a savings account for the selected product
        const checkQuery = `
            SELECT id 
            FROM savings 
            WHERE borrower_id = ? AND savings_product_id = ? AND deleted_at IS NULL LIMIT 1
        `;
        const [existingAccounts] = await pool.query(checkQuery, [borrower_id, savings_product_id]);

        if (existingAccounts.length > 0) {
            return {
                queryStatus: false,
                message: 'Borrower already has a savings account for this product.',
            };
        }

        // Proceed to insert a new savings account
        const query = `
            INSERT INTO savings (borrower_id, savings_product_id, notes, date, created_at, updated_at, branch_id)
            VALUES (?, ?, ?, NOW(), NOW(), NOW(), 1)
        `;

        await pool.query(query, [borrower_id, savings_product_id, notes]);

        return { queryStatus: true, message: 'Savings account created successfully.' };
    } catch (error) {
        return handleError(error, 'storing new savings account');
    }
};


