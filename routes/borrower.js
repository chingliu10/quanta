import express from 'express';
import {
    getAllBorrowers,
    getBorrowerById,
    addBorrower,
    updateBorrower,
    deleteBorrower,
    getBorrowerGroups,
    addBorrowerGroup,
} from '../controllers/borrowers/borrowerController.js';

const router = express.Router();

// Routes for Borrowers
// 1. Get all borrowers
router.get('/view', async (req, res) => {
    try {
        const borrowers = await getAllBorrowers(); // Fetch data from the controller
        console.log(borrowers)
        res.render('borrowersdata', { borrowers }); // Render the view with data
    } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching borrowers'); // Handle errors
    }
});

// 2. Get a single borrower by ID
router.get('/:id', getBorrowerById);

// 3. Add a new borrower
router.post('/', addBorrower);

// 4. Update a borrower by ID
router.put('/:id', updateBorrower);

// 5. Delete a borrower by ID
router.delete('/:id', deleteBorrower);

// Routes for Borrower Groups
// 6. Get all borrower groups
router.get('/groups', getBorrowerGroups);

// 7. Add a borrower group
router.post('/groups', addBorrowerGroup);

export default router;
