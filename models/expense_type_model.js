// models/expense-type-model.js
import { TABLES } from '../config/tables.js';
import connection from '../config/connection.js';

const { pool } = connection;

// Helper: Check if name exists (case-insensitive)
const checkNameExists = async (name) => {
  console.log("8888")
  console.log(name)
  

  // return rows.length > 0;
   const query = `
    SELECT 1 FROM ${TABLES.EXPENSE_TYPE}
    WHERE UPPER(name) = UPPER(?)
    AND deleted_at IS NULL
    LIMIT 1
  `;

  const [rows] = await pool.query(query, [name.trim()]);
  console.log("-----")
  console.log(rows)
  console.log(rows.length > 0)
  return rows.length > 0;
};

// Create new expense type
export const createExpenseType = async (name) => {
  // Validate input
  const trimmedName = name?.trim();
  if (!trimmedName) throw new Error('Expense type name is required');

  // Check uniqueness
  if (await checkNameExists(trimmedName)) {
    throw new Error('Expense type with this name already exists');
  }

  // Insert into database
  const [result] = await pool.query(
    `INSERT INTO ${TABLES.EXPENSE_TYPE} 
     (name, created_at, updated_at)
     VALUES (?, NOW(), NOW())`,
    [trimmedName.toUpperCase()]
  );

  return {
    id: result.insertId,
    name: trimmedName,
    created_at: new Date(),
    updated_at: new Date()
  };
};

// Update existing expense type
export const updateExpenseType = async (id, newName) => {
  const trimmedName = newName?.trim();
  if (!trimmedName) throw new Error('Expense type name is required');

  // Check uniqueness excluding current record
  if (await checkNameExists(trimmedName, id)) {
    throw new Error('Expense type with this name already exists');
  }

  // Update record
  await pool.query(
    `UPDATE ${TABLES.EXPENSE_TYPE}
     SET name = ?, updated_at = NOW()
     WHERE id = ?
     AND deleted_at IS NULL`,
    [trimmedName.toUpperCase(), id]
  );

  // Return updated record
  return getExpenseTypeById(id);
};

// Soft delete expense type
export const deleteExpenseType = async (id) => {
  await pool.query(
    `UPDATE ${TABLES.EXPENSE_TYPE}
     SET deleted_at = NOW()
     WHERE id = ?
     AND deleted_at IS NULL`,
    [id]
  );
};

// Get all active expense types
export const getAllExpenseTypes = async (includeDeleted = false) => {
  const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const [rows] = await pool.query(
    `SELECT id, name, created_at, updated_at
     FROM ${TABLES.EXPENSE_TYPE}
     ${whereClause}`
  );
  return rows;
};

// Get single expense type by ID
export const getExpenseTypeById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, created_at, updated_at
     FROM ${TABLES.EXPENSE_TYPE}
     WHERE id = ?
     AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
};

// Restore soft-deleted expense type
// export const restoreExpenseType = async (id) => {
//   await pool.query(
//     `UPDATE ${TABLES.EXPENSE_TYPE}
//      SET deleted_at = NULL
//      WHERE id = ?`,
//     [id]
//   );
//   return getExpenseTypeById(id);
// };
