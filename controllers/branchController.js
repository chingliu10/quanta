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
    branch_users bu ON b.id = bu.branch_id AND bu.deleted_at is null
WHERE 
    b.deleted_at is null
GROUP BY 
    b.id
        `;

        const [rows] = await pool.query(query);
        return { queryStatus: true, data: rows, message: 'Branches retrieved successfully.' };
    } catch (error) {
        console.log(error)
        return handleError(error, 'Failed To Get Branches');
    }
};


export const findBranch = async (branch_id) => {


    try {
        const query = `
            SELECT id, name from branches Where id = ? and deleted_at is null limit 1
        `
        const [ rows ] = await pool.query(query, [branch_id])

        if(rows.length == 1) {
            return { queryStatus : true , data : rows[0] }
        }

        return { queryStatus : false , message : "Failed To Change Branch"}
    }catch (error) {

        return handleError(error, 'Failed To Change Branch');

    }

}





export const createNewBranch = async (branch_name) => {
    try {
        // Convert branch_name to uppercase for case-insensitive comparison
        const upperBranchName = branch_name.toUpperCase();

        // Check if the branch name already exists
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM branches 
            WHERE name = ? AND deleted_at IS NULL
        `;
        const [rows] = await pool.query(checkQuery, [upperBranchName]);

        if (rows[0].count > 0) {
            return { queryStatus: false, message: 'Branch name already exists.' };
        }

        // Insert the new branch if it doesn't exist
        const insertQuery = `
            INSERT INTO branches (name) VALUES (?)
        `;
        await pool.query(insertQuery, [upperBranchName]);

        return { queryStatus: true, message: 'New branch added successfully.' };
    } catch (error) {
        return handleError(error, 'Failed to add branch');
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
                where branches.id = ? and branch_users.deleted_at is null and users.deleted_at is null;
        `;

        const [rows] = await pool.query(query, [branchId]);

        if (rows.length === 0) {
            const [ rows2 ]= await pool.query(`select branches.name as branch_name, branches.id as branch_id 
                    FROM branches
                `)
            return { queryStatus: false, message: `No users`, data : rows2 };
        }

        return { queryStatus: true, data: rows };

    } catch (error) {
        console.log(error)
        return handleError(error, 'Failed To Get Branch Details');
    }
};


export const deleteBranch = async (branch_name) => {

    try {

        const query = `
            update branches set deleted_at = now() where id = ?
        `

        await pool.query(query, [branch_name])


        return { queryStatus: true, message: 'Branch was deleted' };


    }catch(error) {

            return handleError(error, "Failed to delete branch")
    }


}

// Add user to branch
export const addUserToBranch = async (branchId, userId) => {

    try {
        const query1 = `
          select branch_id, user_id from branch_users WHERE branch_id  = ? and user_id = ? and deleted_at is null LIMIT 1
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
    
        return handleError(error, 'Failed To Add User To Branch');
        
    }

};

//remove user from branch
export const removeUserFromBranch = async (branch , user) => {

        try {

             // Update the deleted_at column instead of deleting the record
            const [result] = await pool.query(
                `UPDATE branch_users 
                SET deleted_at = NOW() 
                WHERE branch_id = ? AND user_id = ? AND deleted_at IS NULL`,
                [branch, user]
            );

            if (result.affectedRows > 0) {
                return {
                    queryStatus: true,
                    message: 'User successfully soft deleted from the branch.',
                };
            } else {
                return {
                    queryStatus: false,
                    message: 'User Not Found',
                };
            }

        }catch (error) {

            return handleError(error, 'Failed To Remove User');

        }
    

}

export const getBranchName = async (branch_id) => {

    try {

        const query = `select id, name from branches where id = ? and deleted_at is null limit 1`
        const [rows] = await pool.query(query, [ branch_id ])

        return { queryStatus : true , data : rows[0]}


    }catch (error) {

        handleError(error, 'Failed To Get Branch Name')

    }

}

export const checkBranchNameExists = async (name , branch) => {

    try {
        const query = `
            SELECT *
            FROM branches 
            WHERE name = UPPER(?) 
            AND deleted_at IS NULL
            LIMIT 1
        `;
        
        const [rows] = await pool.query(query, [name, branch]);
        
        if(rows.length > 0) {

            return {
                queryStatus: true,
                message : "Branch Does Exist"
            };

        } 

        return { queryStatus : true , message : "Move On"}

    } catch (error) {

        return handleError(error, 'Failed To Check Branch Name');
        
    }
}


export const updateBranch = async (branchId, name) => {


    try {
        const query = `
            UPDATE branches 
            SET name =  UPPER(?), 
                updated_at = NOW() 
            WHERE id = ? 
            AND deleted_at IS NULL
        `;
        
        const [result] = await pool.query(query, [name, branchId]);
        
        if (result.affectedRows === 0) {
            return {
                queryStatus: false,
                activity: "Branch not found or no changes made"
            };
        }

        return {
            queryStatus: true,
            message : "Branch updated successfully"
        };
    } catch (error) {
        console.log(error)
        return handleError(error, 'Failed to update branch');
    }

}

