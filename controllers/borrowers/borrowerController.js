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
export const addBorrower = (req, res) => {
    try {
        const { name, email, phone, groupId } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const newBorrower = {
            id: `${Date.now()}`, // Replace with a proper unique ID generator
            name,
            email,
            phone,
            groupId: groupId || null,
        };

        borrowers.push(newBorrower);

        res.status(201).json({
            success: true,
            message: 'Borrower added successfully',
            data: newBorrower,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding borrower', error });
    }
};

// Update a borrower by ID
export const updateBorrower = (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, groupId } = req.body;

        const borrower = borrowers.find((b) => b.id === id);

        if (!borrower) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        borrower.name = name || borrower.name;
        borrower.email = email || borrower.email;
        borrower.phone = phone || borrower.phone;
        borrower.groupId = groupId || borrower.groupId;

        res.status(200).json({
            success: true,
            message: 'Borrower updated successfully',
            data: borrower,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating borrower', error });
    }
};

// Delete a borrower by ID
export const deleteBorrower = (req, res) => {
    try {
        const { id } = req.params;

        const index = borrowers.findIndex((b) => b.id === id);

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Borrower not found' });
        }

        borrowers.splice(index, 1);

        res.status(200).json({
            success: true,
            message: 'Borrower deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting borrower', error });
    }
};

// Get all borrower groups
export const getBorrowerGroups = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: borrowerGroups,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching borrower groups', error });
    }
};

// Add a borrower group
export const addBorrowerGroup = (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Group name is required' });
        }

        const newGroup = {
            id: `${Date.now()}`, // Replace with a proper unique ID generator
            name,
            description: description || '',
        };

        borrowerGroups.push(newGroup);

        res.status(201).json({
            success: true,
            message: 'Borrower group added successfully',
            data: newGroup,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding borrower group', error });
    }
};
