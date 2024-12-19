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
            WHERE borrower_id = ? AND savings_product_id = ? AND deleted_at IS NULL LIMIT 1`;
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




// Get all savings transactions
export const getSavingsTransactions = async () => {
    try {
        const query = `
            SELECT 
                borrowers.first_name AS first_name,
                borrowers.last_name AS last_name,
                savings.id AS savings_id,
                savings_transactions.date AS transaction_date,
                savings_transactions.time AS transaction_time,
                savings_transactions.type AS transaction_type,
                savings_transactions.amount AS amount
            FROM 
                savings_transactions
            JOIN 
                savings ON savings.id = savings_transactions.savings_id
            JOIN 
                borrowers ON borrowers.id = savings.borrower_id
            WHERE 
                savings_transactions.deleted_at IS NULL
            ORDER BY 
                savings_transactions.date DESC, savings_transactions.time DESC;
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, 'fetching savings transactions');
    }
};


export const storeSavingsProduct = async (data) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, interest_rate, allow_overdraw, interest_posting, interest_adding, minimum_balance } = data;

        // Check if a savings product with the same name already exists
        const checkQuery = `
            SELECT id 
            FROM savings_products 
            WHERE name = ? 
            AND deleted_at IS NULL 
            LIMIT 1;
        `;
        const [existingProduct] = await connection.query(checkQuery, [name]);

        if (existingProduct.length > 0) {
            await connection.rollback();
            return {
                queryStatus: false,
                message: 'A savings product with this name already exists.',
            };
        }

        // Insert the new savings product
        const query = `
            INSERT INTO savings_products (name, interest_rate, allow_overdraw, interest_posting, interest_adding, minimum_balance, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
        `;

        await connection.query(query, [name, interest_rate, allow_overdraw, interest_posting, interest_adding, minimum_balance]);

        await connection.commit();
        return { queryStatus: true, message: 'Savings product added successfully.' };
    } catch (error) {
        await connection.rollback();
        return handleError(error, 'storing new savings product');
    } finally {
        connection.release();
    }
};



// Get all savings products
export const getSavingsProducts = async () => {
    try {
        const query = `
            SELECT id, name, interest_rate, interest_posting, minimum_balance
            FROM savings_products
            WHERE deleted_at IS NULL;
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, 'fetching savings products');
    }
};


