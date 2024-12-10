import connection from '../../config/connection.js';
const { pool } = connection;

// Get all borrowers
export const getAllBorrowers = async () => {
    try {
        const query = `SELECT id, first_name, last_name, business_name, mobile, email FROM borrowers`;
        const [rows] = await pool.query(query); // Execute the query
        return rows; // Return the fetched rows
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching borrowers'); // Throw an error for the route to handle
    }
};


// Get a single borrower by ID
export const getBorrowerById = (req, res) => {
    try {
        const { id } = req.params;
        const borrower = borrowers.find((b) => b.id === id);

        if (!borrower) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        res.status(200).json({
            success: true,
            data: borrower,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching borrower', error });
    }
};

// Add a new borrower
export const addBorrower =  async (borrower) => {
    try {

        console.log("sdfsdfsdfsdfsdfsd")
        console.log(borrower)

        console.log("adasd hey controller")
        console.log(borrower)
        console.log("adasd hey controller")

        const { first_name, last_name, gender, business, address, mobile } = borrower;

        const checkQuery = `SELECT first_name , last_name FROM borrowers WHERE first_name = ? AND last_name = ? LIMIT 1`;
        const dbCheckQuery = await pool.query(checkQuery, [
            first_name.trim().toUpperCase(),
            last_name.trim().toUpperCase()
        ])


        if(dbCheckQuery[0].length > 0) {
                return {
                    queryStatus : true ,
                    message : "user found"
                }
        }
        
        const query = `INSERT INTO borrowers (first_name, last_name, gender, business_name, address, mobile, branch_id, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const dbRequest = await pool.query(query, [
            first_name.trim().toUpperCase(),  // Trim to ensure no leading/trailing spaces
            last_name.trim().toUpperCase(),
            gender,
            business,
            address,
            mobile,
            1,                  // Branch ID
            new Date(),         // Created at timestamp
        ]);

        return {
            queryStatus : true,
            message : "success"
        }


    } catch (error) {


        console.log(error)

        return {
            queryStatus : false,
            errorInformation : { errorNo : error.errno , errorCode : error.code , errorMessage : error.sqlMessage },
            activity : "adding borrower inside database"
        }

    }
};


export const getEditBorrower = async (id) => {
    try {
    
        const query = `SELECT id, first_name, last_name, gender, business_name, address, mobile FROM borrowers WHERE id = ? LIMIT 1`;
        const [borrowers] = await pool.query(query, [id]);

        return {
            queryStatus : true ,
            message : "success",
            data : borrowers[0]
        }

    } catch (error) {

        return {
            queryStatus : false,
            errorInformation : { errorNo : error.errno , errorCode : error.code , errorMessage : error.sqlMessage },
            activity : "adding borrower inside database"
        }      

    }
};

// Update a borrower by ID
export const updateBorrower =  async (borrowerId , borrowerData) => {
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

        return {
            queryStatus : true,
            message : "success"
        }
       
      
    } catch (error) {
        
        return {
            queryStatus : false,
            errorInformation : { errorNo : error.errno , errorCode : error.code , errorMessage : error.sqlMessage },
            activity : "Updating borrower inside database"
        }  
    }

};


export const getBorrowerDetails = async (id) => {
    try {
    
        const query = `SELECT id, first_name, last_name, gender, business_name, address, mobile FROM borrowers WHERE id = ? LIMIT 1`;
        const [borrowers] = await pool.query(query, [id]);

        return {
            queryStatus : true ,
            message : "success",
            data : borrowers[0]
        }

    } catch (error) {

        return {
            queryStatus : false,
            errorInformation : { errorNo : error.errno , errorCode : error.code , errorMessage : error.sqlMessage },
            activity : "getting borrower details inside database"
        }      

    }
};

// // Delete a borrower by ID
// export const deleteBorrower = (req, res) => {
//     try {
//         const { id } = req.params;

//         const index = borrowers.findIndex((b) => b.id === id);

//         if (index === -1) {
//             return res.status(404).json({ success: false, message: 'Borrower not found' });
//         }

//         borrowers.splice(index, 1);

//         res.status(200).json({
//             success: true,
//             message: 'Borrower deleted successfully',
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error deleting borrower', error });
//     }
// };

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
