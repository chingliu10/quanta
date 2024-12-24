import express from 'express';
import { getBranches } from '../controllers/branchController.js';

const router = express.Router();

router.use(express.json());

// Route to view branches
router.get('/view', async (req, res) => {
    try {
        const result = await getBranches();

        if (result.queryStatus) {
            console.log(result);
            return res.render('branch_view', { branches: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error fetching branches:', error);
        req.session.error = 'An unexpected error occurred.';
        res.redirect('/dashboard');
    }
});

export default router;
