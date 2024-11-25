import express from 'express';
import connection from '../../config/connection.js'; 

const { pool } = connection; 

const router = express.Router();

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is authenticated, proceed to the next middleware
    }

    // User is not authenticated, return a 401 Unauthorized error
    res.status(401).json({
        error: 'Unauthorized',
        message: 'Please log in to access this resource.',
    });
};

// Main dashboard route (not using ensureAuthenticated)
router.get('/', (req, res) => {
    if (!req.session.user) {
        req.session.error = 'Please log in to access the dashboard.';
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
});

// Subroute: Get Borrowers
router.get('/getborrowers', ensureAuthenticated, async (req, res) => {
    try {
        const [borrowers] = await pool.query('SELECT COUNT(*) AS totalBorrowers FROM borrowers where deleted_at is null');
        res.json({ totalBorrowers: borrowers[0].totalBorrowers });
    } catch (error) {
        console.error('Error fetching borrowers:', error);
        res.status(500).json({ message: 'Failed to fetch borrowers.' });
    }
});

// Subroute: Total Loans Released
router.get('/totalloansreleased', ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await pool.query('SELECT SUM(principal) AS totalLoans FROM loans where deleted_at is null');
        res.json({ totalLoans: result[0].totalLoans });
    } catch (error) {
        console.error('Error fetching total loans:', error);
        res.status(500).json({ message: 'Failed to fetch total loans.' });
    }
});

// Subroute: Total Collection
router.get('/totalcollection', ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await pool.query('SELECT SUM(amount) AS totalCollection FROM loan_repayments where deleted_at is null');
        res.json({ totalCollection: result[0].totalCollection });
    } catch (error) {
        console.error('Error fetching total collection:', error);
        res.status(500).json({ message: 'Failed to fetch total collection.' });
    }
});

// Subroute: Outstanding Open Loans
router.get('/outstandingopenloans', ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await pool.query('select sum(due) as outstanding from loan_schedules;');
        res.json({ outstanding: result[0].outstanding });
    } catch (error) {
        console.error('Error fetching outstanding loans:', error);
        res.status(500).json({ message: 'Failed to fetch outstanding loans.' });
    }
});

// Subroute: Open Loans
router.get('/openloans', ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await pool.query('SELECT COUNT(*) as openloans FROM loans WHERE status = "disbursed" and deleted_at is null');
        res.json({ openloans : result[0].openloans  });
    } catch (error) {
        console.error('Error fetching open loans:', error);
        res.status(500).json({ message: 'Failed to fetch open loans.' });
    }
});

export default router;
