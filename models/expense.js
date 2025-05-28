// models/expense-model.js
import { TABLES } from '../config/tables.js';
import connection from '../config/connection.js';

const { pool } = connection;

// Helper: Validate required fields
const validateExpenseData = (data) => {
  if (!data.amount || isNaN(data.amount) || parseFloat(data.amount) <= 0) {
    throw new Error('Valid amount is required');
  }
};

// Create new expense
export const createExpense = async (expenseData) => {
  validateExpenseData(expenseData);

  // Validate relations if provided
  if (expenseData.expense_type_id) {
    const [typeRows] = await pool.query(
      `SELECT id FROM ${TABLES.EXPENSE_TYPE} 
       WHERE id = ? AND deleted_at IS NULL`,
      [expenseData.expense_type_id]
    );
    if (!typeRows.length) throw new Error('Invalid expense type');
  }

  if (expenseData.user_id) {
    const [userRows] = await pool.query(
      `SELECT id FROM ${TABLES.USERS} WHERE id = ?`,
      [expenseData.user_id]
    );
    if (!userRows.length) throw new Error('Invalid user');
  }

  // Prepare fields
  const fields = {
    user_id: expenseData.user_id || null,
    expense_type_id: expenseData.expense_type_id || null,
    amount: parseFloat(expenseData.amount).toFixed(2),
    date: expenseData.date || null,
    year: expenseData.year || null,
    month: expenseData.month || null,
    recurring: expenseData.recurring ? 1 : 0,
    recur_frequency: expenseData.recur_frequency || '31',
    recur_start_date: expenseData.recur_start_date || null,
    recur_end_date: expenseData.recur_end_date || null,
    recur_next_date: expenseData.recur_next_date || null,
    recur_type: expenseData.recur_type || 'month',
    notes: expenseData.notes || null,
    files: expenseData.files ? JSON.stringify(expenseData.files) : null,
    branch_id: expenseData.branch_id || null
  };

  const [result] = await pool.query(
    `INSERT INTO ${TABLES.EXPENSES} 
     (${Object.keys(fields).join(', ')}, created_at, updated_at)
     VALUES (${Object.values(fields).map(() => '?').join(', ')}, NOW(), NOW())`,
    Object.values(fields)
  );

  return {
    id: result.insertId,
    ...fields,
    created_at: new Date(),
    updated_at: new Date()
  };
};

// Update existing expense
export const updateExpense = async (id, updates) => {
  const existingExpense = await getExpenseById(id);
  if (!existingExpense) throw new Error('Expense not found');

  // Validate relations if updating
  if (updates.expense_type_id) {
    const [typeRows] = await pool.query(
      `SELECT id FROM ${TABLES.EXPENSE_TYPE} 
       WHERE id = ? AND deleted_at IS NULL`,
      [updates.expense_type_id]
    );
    if (!typeRows.length) throw new Error('Invalid expense type');
  }

  if (updates.user_id) {
    const [userRows] = await pool.query(
      `SELECT id FROM ${TABLES.USERS} WHERE id = ?`,
      [updates.user_id]
    );
    if (!userRows.length) throw new Error('Invalid user');
  }

  // Prepare updates
  const validFields = [
    'user_id', 'expense_type_id', 'amount', 'date', 'year', 'month',
    'recurring', 'recur_frequency', 'recur_start_date', 'recur_end_date',
    'recur_next_date', 'recur_type', 'notes', 'files', 'branch_id'
  ];

  const updateData = {};
  validFields.forEach(field => {
    if (updates[field] !== undefined) {
      if (field === 'amount') {
        updateData[field] = parseFloat(updates[field]).toFixed(2);
      } else if (field === 'files') {
        updateData[field] = updates[field] ? JSON.stringify(updates[field]) : null;
      } else if (field === 'recurring') {
        updateData[field] = updates[field] ? 1 : 0;
      } else {
        updateData[field] = updates[field];
      }
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields provided for update');
  }

  await pool.query(
    `UPDATE ${TABLES.EXPENSES}
     SET ${Object.keys(updateData).map(f => `${f} = ?`).join(', ')}, updated_at = NOW()
     WHERE id = ?`,
    [...Object.values(updateData), id]
  );

  return getExpenseById(id);
};

// Delete expense (hard delete)
export const deleteExpense = async (id) => {
  await pool.query(
    `DELETE FROM ${TABLES.EXPENSES} WHERE id = ?`,
    [id]
  );
};

// Get all expenses
export const getAllExpenses = async (filters = {}) => {
  
   let query = `
    SELECT 
      et.name AS expense_type_name,
      e.amount,
      e.date,
      e.recurring,
      e.notes as description,
      e.files
    FROM ${TABLES.EXPENSES} e
    LEFT JOIN ${TABLES.EXPENSE_TYPE} et ON e.expense_type_id = et.id AND et.deleted_at IS NULL
  `;

  const params = [];
  const whereClauses = [];

  // Apply filters
  if (filters.user_id) {
    whereClauses.push('e.user_id = ?');
    params.push(filters.user_id);
  }
  if (filters.expense_type_id) {
    whereClauses.push('e.expense_type_id = ?');
    params.push(filters.expense_type_id);
  }
  if (filters.branch_id) {
    whereClauses.push('e.branch_id = ?');
    params.push(filters.branch_id);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  query += ` ORDER BY e.date DESC`;

  const [rows] = await pool.query(query, params);

  return rows.map(row => ({
    ...row,
    files: row.files ? JSON.parse(row.files) : null,
  }));
};

// Get single expense by ID
export const getExpenseById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLES.EXPENSES} WHERE id = ?`,
    [id]
  );
  return rows[0] ? {
    ...rows[0],
    files: rows[0].files ? JSON.parse(rows[0].files) : null
  } : null;
};