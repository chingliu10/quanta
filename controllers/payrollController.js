import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all payroll entries
export const getAllPayrolls = async () => {
    try {
        const query = `
            SELECT 
                u.first_name AS first_name,
                u.last_name AS last_name,
                p.date AS last_pay_date,
                p.paid_amount AS last_paid_amount,
                p.id as payroll_id
            FROM 
                payroll p
            JOIN 
                users u ON p.user_id = u.id
            WHERE 
                p.deleted_at IS NULL
            ORDER BY 
                p.date DESC;
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, 'fetching all payroll entries');
    }
};

// Get payroll details for a specific user
export const getPayrollByUser = async (userId) => {
    try {
        const query = `
            SELECT 
                p.id AS payroll_id,
                p.date AS date,
                p.paid_amount AS paid_amount,
                p.description AS description,
                p.comments AS comments
            FROM 
                payroll p
            WHERE 
                p.user_id = ? AND p.deleted_at IS NULL
            ORDER BY 
                p.date DESC;
        `;

        const [rows] = await pool.query(query, [userId]);
        return { queryStatus: true, data: rows, message: 'success' };
    } catch (error) {
        return handleError(error, `fetching payroll for user ID: ${userId}`);
    }
};

// Add a new payroll entry
export const storePayroll = async (data) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { user_id, paid_amount, description, comments, payment_method, bank_name, account_number, date } = data;
        const query = `
            INSERT INTO payroll (
                user_id, paid_amount, description, comments, payment_method, bank_name, account_number, date, year, month, created_at, updated_at, branch_id
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, YEAR(?), MONTH(?), NOW(), NOW(), 1
            );
        `;

        await connection.query(query, [
            user_id, paid_amount, description, comments, payment_method, bank_name, account_number, date, date, date
        ]);

        await connection.commit();
        return { queryStatus: true, message: 'Payroll entry added successfully.' };
    } catch (error) {
        await connection.rollback();
        return handleError(error, 'adding new payroll entry');
    } finally {
        connection.release();
    }
};

// Delete a payroll entry
export const deletePayroll = async (payrollId) => {
    try {
        const query = `
            UPDATE payroll
            SET deleted_at = NOW()
            WHERE id = ?;
        `;

        await pool.query(query, [payrollId]);
        return { queryStatus: true, message: 'Payroll entry deleted successfully.' };
    } catch (error) {
        return handleError(error, `deleting payroll entry ID: ${payrollId}`);
    }
};


// Fetch all employees
export const getEmployees = async () => {
    try {
        const query = `
            SELECT id, first_name, last_name 
            FROM users 
            WHERE deleted_at IS NULL;
        `;
        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'Employees fetched successfully.' };
    } catch (error) {
        return handleError(error, 'fetching employees');
    }
};


export const getPayrollById = async (id) => {
    try {
        const query = `
            SELECT 
                u.first_name,
                u.last_name,
                p.date,
                p.paid_amount,
                p.description,
                p.comments,
                p.payment_method,
                p.bank_name,
                p.account_number
            FROM 
                payroll p
            JOIN 
                users u ON p.user_id = u.id
            WHERE 
                p.id = ? AND p.deleted_at IS NULL
            LIMIT 1;
        `;
        const [rows] = await pool.query(query, [id]);
        if (rows.length === 0) {
            return { queryStatus: false, message: 'Payroll not found' };
        }
        return { queryStatus: true, data: rows[0], message: 'Payroll fetched successfully' };
    } catch (error) {
        return handleError(error, `fetching payroll by ID: ${id}`);
    }
};
