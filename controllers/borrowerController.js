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


export const getBorrowerGroups = async () => {


    try {
    const query = `
    SELECT 
    bg.id as borrower_group_id,
    bg.name,
    COUNT(bgm.borrower_id) as total_borrowers
FROM borrower_groups bg
LEFT JOIN borrower_group_members bgm ON bg.id = bgm.borrower_group_id
where bgm.deleted_at is null
GROUP BY bg.id, bg.name;
    `

    const [rows] = await pool.query(query);

    return { queryStatus : true , data : rows }

    } catch (error) {

        console.log(error)
        return handleError(error, 'Failed to Get borrower groups');
    }

}

export const storeBorrowerGroup = async (groupName) => {
    try {

        let trimName = groupName.trim()

        //see if the name does exist

        const nameExistQuery = `
            select name from borrower_groups where name = ? limit 1
         `
        let result1 = await pool.query(nameExistQuery, [groupName]);

        if(result1[0].length > 0) {
            return { queryStatus : true , message : "found" }
        }

        const insertGroupNameQuery = `
            INSERT into borrower_groups (name) values (?)
        `

        await pool.query(insertGroupNameQuery, [ groupName.toUpperCase() ])

        return {  queryStatus : true }

    }catch (error) {

        return handleError(error , "Failed To Insert Group")

    }
}



export const getLoansFromGroup = async (groupName) => {


    try {

        const query = `
            WITH group_info AS (
    SELECT name as group_name 
    FROM borrower_groups 
    WHERE id = ?
)
SELECT 
    borrowers.id as borrower_id,
    borrowers.first_name,
    borrowers.last_name,
    borrowers.mobile,
    group_info.group_name,
    COUNT(DISTINCT loans.id) AS total_loans,
    COALESCE(SUM(ls.total_due), 0) AS total_due,
    COALESCE(SUM(lr.total_paid), 0) AS total_paid,
    COALESCE(SUM(ls.total_due), 0) - COALESCE(SUM(lr.total_paid), 0) AS total_balance
FROM 
    borrower_group_members
    JOIN borrowers ON borrower_group_members.borrower_id = borrowers.id
    CROSS JOIN group_info
    LEFT JOIN loans ON loans.borrower_id = borrowers.id 
        AND loans.deleted_at IS NULL
    LEFT JOIN (
        SELECT 
            loan_id,
            SUM(due + fees) as total_due
        FROM loan_schedules 
        WHERE deleted_at IS NULL
        GROUP BY loan_id
    ) ls ON ls.loan_id = loans.id
    LEFT JOIN (
        SELECT 
            loan_id,
            SUM(amount) as total_paid
        FROM loan_repayments 
        WHERE deleted_at IS NULL
        GROUP BY loan_id
    ) lr ON lr.loan_id = loans.id
WHERE 
    borrower_group_members.borrower_group_id = ?
        and borrower_group_members.deleted_at is null
GROUP BY 
    borrowers.id
ORDER BY 
    borrowers.first_name, 
    borrowers.last_name;
        `
    
    const [rows] = await pool.query(query, [groupName , groupName])


         return { queryStatus : true , data : rows }
 


    }catch (error) {

        console.log(error)
        return handleError(error, "Failed To Get Borrower Group")


    }

}


export const addBorrowerToGroup = async (borrower , group) => {


    try {


        const query = `
            select id from borrower_group_members where borrower_group_id = ? and borrower_id = ?
                and deleted_at is NULL LIMIT 1
        `

        let [ rows ] = await pool.query(query, [ group , borrower ])

        if(rows.length > 0) {

            return { queryStatus : true , message : "found" }

        }

        const currentTimestamp = new Date()

        const query2 = `
            insert into borrower_group_members (borrower_group_id , borrower_id, created_at, updated_at)
            values (?, ?, ? , ?)
        `

        await pool.query(query2, [ group , borrower , currentTimestamp , currentTimestamp ])

        return { queryStatus : true , message : "done" }


    }catch (error) {


        console.log(error)
        return handleError(error , "Failed To Add Borrower To Group")


    }

}



export const getGroupName = async (group) => {

    try {

        let query = `
            select name from borrower_groups where id = ? limit 1
        `
        let [rows] = await pool.query(query , [group])

        return { queryStatus : true , data : rows }

    }catch (error) {

        return handleError("Failed To Get Group Name")

    }
}

export const removeBorrowerFromGroup = async (group, borrower) => {


    try {

        let currentTimestamp = new Date()

        let query = `
            update borrower_group_members set deleted_at = ?
                where borrower_group_id = ? and borrower_id = ?
        `

        await pool.query(query, [currentTimestamp, group, borrower])

        return {
            queryStatus : true
        }

    }catch (error) {

        handleError(error, "Failed To Remove Borrower From Group")

    }

}
