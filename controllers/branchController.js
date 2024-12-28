import connection from '../config/connection.js';
import handleError from '../helpers/handleError.js';

const { pool } = connection;

// Get all branches
export const getBranches = async () => {
    try {
        const query = `
            SELECT 
                b.id AS branch_id,
                b.name AS branch_name,
                COUNT(bu.id) AS user_count,
                b.notes AS branch_notes
            FROM 
                branches b
            LEFT JOIN 
                branch_users bu ON b.id = bu.branch_id
            GROUP BY 
                b.id
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'Branches retrieved successfully.' };
    } catch (error) {
        return handleError(error, 'Failed To Get Branches');
    }
};



// Fetch details of a specific branch by ID
export const getBranchDetails = async (branchId) => {
    try {
        const query = `
            select branches.name as branch_name , branches.id as branch_id , users.id as user_id , users.first_name , users.last_name , users.email , users.phone from branches
                join branch_users 
            on branches.id = branch_users.branch_id
                join users 
            on branch_users.user_id = users.id
                where branches.id = ?;
        `;

        const [rows] = await pool.query(query, [branchId]);

        if (rows.length === 0) {
            return { queryStatus: false, message: `Branch with ID ${branchId} not found.` };
        }

        return { queryStatus: true, data: rows };

    } catch (error) {
        return handleError(error, 'Failed To Get Branch Details');
    }
};


// Add user to branch
export const addUserToBranch = async (branchId, userId) => {

    try {
        const query1 = `
          select branch_id, user_id from branch_users WHERE branch_id  = ? and user_id = ? LIMIT 1
        `;

      const checkIfUserIsAlreadyAdded =  await pool.query(query1, [branchId, userId]);

       if(checkIfUserIsAlreadyAdded[0].length > 0) {
          //user is already added
          return { queryStatus : false , message : "User does exist in this branch" } 
       }


       const todayTime = new Date()

       const query2 = `
         Insert into branch_users (branch_id, user_id, created_at, updated_at) values (?,?,?,?)
     `;

        await pool.query(query2, [branchId, userId, todayTime, todayTime]);
        return { queryStatus: true, message: 'User successfully added to branch.' };

    } catch (error) {
        console.log(error)
        return handleError(error, 'Failed To Add User To Branch');
    }

};


