import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';
const { pool } = connection;

// Get all borrowers
export const getAllBorrowers = async (branch) => {
    try {
        const query = `SELECT id, first_name, last_name, business_name, mobile, email 
         FROM borrowers where deleted_at IS NULL AND branch_id = ?`;
        const [rows] = await pool.query(query, [ branch ]); // Execute the query
        return rows; // Return the fetched rows
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching borrowers'); // Throw an error for the route to handle
    }
};




// Add a new borrower
export const addBorrower = async (borrower) => {
    try {
        const { first_name, last_name, gender, business, address, mobile } = borrower;

        const checkQuery = `SELECT first_name, last_name FROM borrowers WHERE first_name = ? AND last_name = ? LIMIT 1`;
        const [existingBorrowers] = await pool.query(checkQuery, [
            first_name.trim().toUpperCase(),
            last_name.trim().toUpperCase(),
        ]);

        console.log(existingBorrowers);
        if (existingBorrowers.length > 0) {
            return {
                queryStatus: false,
                message: 'Borrower already exists',
                errorType: 'conflict',
            };
        }

        const query = `INSERT INTO borrowers (first_name, last_name, gender, business_name, address, mobile, branch_id, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(query, [
            first_name.trim().toUpperCase(),
            last_name.trim().toUpperCase(),
            gender,
            business,
            address,
            mobile,
            1, // Branch ID
            new Date(), // Created at timestamp
        ]);

        return {
            queryStatus: true,
            message: 'Borrower added successfully',
        };
    } catch (error) {
        return handleError(error, 'adding borrower inside database');
    }
};

// Get borrower details for editing
export const getEditBorrower = async (id) => {
    try {
        const query = `SELECT id, first_name, last_name, gender, business_name, address, mobile FROM borrowers WHERE id = ? LIMIT 1`;
        const [borrowers] = await pool.query(query, [id]);

        if (borrowers.length === 0) {
            return {
                queryStatus: false,
                message: 'Borrower not found',
                errorType: 'not_found',
            };
        }

        return {
            queryStatus: true,
            message: 'success',
            data: borrowers[0],
        };
    } catch (error) {
        return handleError(error, 'fetching borrower for edit');
    }
};

// Update a borrower
export const updateBorrower = async (borrowerId, borrowerData) => {
    try {
        const { first_name, last_name, gender, mobile, business, address } = borrowerData;

        const query = `
            UPDATE borrowers
            SET first_name = ?, last_name = ?, gender = ?, mobile = ?, business_name = ?, address = ?, updated_at = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [
            first_name.trim().toUpperCase(),
            last_name.trim().toUpperCase(),
            gender,
            mobile,
            business,
            address,
            new Date(),
            borrowerId,
        ]);

        if (result.affectedRows === 0) {
            return {
                queryStatus: false,
                message: 'No changes were made or borrower not found',
                errorType: 'no_changes',
            };
        }

        return {
            queryStatus: true,
            message: 'Borrower updated successfully',
        };
    } catch (error) {
        return handleError(error, 'updating borrower');
    }
};

// Get borrower details
export const getBorrowerDetails = async (id) => {
    try {
        const query = `SELECT id, first_name, last_name, gender, business_name, address, mobile FROM borrowers WHERE id = ? LIMIT 1`;
        const [borrowers] = await pool.query(query, [id]);

        if (borrowers.length === 0) {
            return {
                queryStatus: false,
                message: 'Borrower not found',
                errorType: 'not_found',
            };
        }

        return {
            queryStatus: true,
            message: 'success',
            data: borrowers[0],
        };
    } catch (error) {
        return handleError(error, 'getting borrower details inside database');
    }
};

// Delete a borrower
export const deleteBorrower = async (borrowerId) => {
    try {
        const query = `
            UPDATE borrowers
            SET deleted_at = ?, updated_at = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [new Date(), new Date(), borrowerId]);

        if (result.affectedRows === 0) {
            return {
                queryStatus: false,
                message: 'Borrower not found',
                errorType: 'not_found',
            };
        }

        return {
            queryStatus: true,
            message: 'Borrower deleted successfully',
        };
    } catch (error) {
        return handleError(error, 'deleting borrower');
    }
};


export const getBorrowerLoans = async (borrowerId) => {
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
    borrowers ON borrowers.id = loans.borrower_id
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
    ) AS due_totals ON loans.id = due_totals.loan_id
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
    ) AS paid_totals ON loans.id = paid_totals.loan_id
WHERE
    loans.deleted_at IS NULL
    AND borrowers.id = ?
        `

    const [ loans ] = await pool.query(query, [borrowerId]);
    if(loans.length === 0) {
        return {
            queryStatus : true,
            message : "No loans"
        }
    }

    return {

            queryStatus : true,
            data : loans
    }


    }catch (error) {

        return handleError(error, 'Failed to Get Loans Of The Borrower');

    }
}

// // Get all borrower groups
// export const getBorrowerGroups = (req, res) => {
//     try {
//         res.status(200).json({
//             success: true,
//             data: borrowerGroups,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error fetching borrower groups', error });
//     }
// };

// // Add a borrower group
// export const addBorrowerGroup = (req, res) => {
//     try {
//         const { name, description } = req.body;

//         if (!name) {
//             return res.status(400).json({ success: false, message: 'Group name is required' });
//         }

//         const newGroup = {
//             id: `${Date.now()}`, // Replace with a proper unique ID generator
//             name,
//             description: description || '',
//         };

//         borrowerGroups.push(newGroup);

//         res.status(201).json({
//             success: true,
//             message: 'Borrower group added successfully',
//             data: newGroup,
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error adding borrower group', error });
//     }
// };
