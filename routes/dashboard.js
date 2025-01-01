import express from 'express';
import connection from '../config/connection.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const { pool } = connection;
const router = express.Router();



router.use(isAuthenticated)

// Main dashboard route (not using isAuthenticated)
router.get('/',  (req, res) => {
    if (!req.session.user) {
        req.session.error = 'Please log in to access the dashboard.';
        return res.redirect('/login');
    }

    console.log(req.session);
    res.render('dashboard', { title : "Dashboard", user: req.session.user });
});

// Subroute: Get Borrowers
router.get('/getborrowers',   async (req, res) => {
    try {
        const [borrowers] = await pool.query(`SELECT COUNT(*) AS totalBorrowers FROM borrowers WHERE deleted_at  IS NULL
            AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ totalBorrowers: borrowers[0].totalBorrowers });
    } catch (error) {
        console.error('Error fetching borrowers:', error);
        res.status(500).json({ message: 'Failed to fetch borrowers.' });
    }
});

// Subroute: Total Loans Released
router.get('/totalloansreleased',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT SUM(principal) AS totalLoans FROM loans WHERE deleted_at IS NULL 
            AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ totalLoans: result[0].totalLoans });
    } catch (error) {
        console.error('Error fetching total loans:', error);
        res.status(500).json({ message: 'Failed to fetch total loans.' });
    }
});

// Subroute: Total Collection
router.get('/totalcollection',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT SUM(amount) AS totalCollection FROM loan_repayments WHERE deleted_at IS NULL
            AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ totalCollection: result[0].totalCollection });
    } catch (error) {
        console.error('Error fetching total collection:', error);
        res.status(500).json({ message: 'Failed to fetch total collection.' });
    }
});

// Subroute: Outstanding Open Loans
router.get('/outstandingopenloans',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT SUM(due) AS outstanding FROM loan_schedules where deleted_at is null and branch_id = ?;`,
            [req.session.user.branchId]
        );
        res.json({ outstanding: result[0].outstanding });
    } catch (error) {
        console.error('Error fetching outstanding loans:', error);
        res.status(500).json({ message: 'Failed to fetch outstanding loans.' });
    }
});

// Subroute: Open Loans
router.get('/openloans',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT COUNT(*) AS openloans FROM loans 
             WHERE status = "disbursed" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ openloans: result[0].openloans });
    } catch (error) {
        console.error('Error fetching open loans:', error);
        res.status(500).json({ message: 'Failed to fetch open loans.' });
    }
});

// Subroute: Closed Loans
router.get('/closedloans',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT COUNT(*) AS closedloans FROM loans 
             WHERE status = "closed" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ closedloans: result[0].closedloans });
    } catch (error) {
        console.error('Error fetching closed loans:', error);
        res.status(500).json({ message: 'Failed to fetch closed loans.' });
    }
});

// Subroute: Pending Loans
router.get('/pendingloans',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT COUNT(*) AS pendingloans FROM loans 
             WHERE status = "pending" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ pendingloans: result[0].pendingloans });
    } catch (error) {
        console.error('Error fetching pending loans:', error);
        res.status(500).json({ message: 'Failed to fetch pending loans.' });
    }
});

// Subroute: Awaiting Disbursement
router.get('/awaitingdisbursement',   async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT COUNT(*) AS awaitingDisbursement FROM loans 
             WHERE status = "approved" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ awaitingDisbursement: result[0].awaitingDisbursement });
    } catch (error) {
        console.error('Error fetching awaiting disbursement:', error);
        res.status(500).json({ message: 'Failed to fetch awaiting disbursement.' });
    }
});

// Subroute: Savings Deposited
router.get('/savingsdeposited'  , async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT SUM(amount) AS savingsDeposited FROM savings_transactions
             WHERE type = "deposit" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ savingsDeposited: result[0].savingsDeposited });
    } catch (error) {
        console.error('Error fetching savings deposited:', error);
        res.status(500).json({ message: 'Failed to fetch savings deposited.' });
    }
});

// Subroute: Savings Withdrawn
router.get('/savingswithdrawn'  , async (req, res) => {
    try {
        const [result] = await pool.query(`SELECT SUM(amount) AS savingsWithdrawn FROM savings_transactions
              WHERE type = "withdraw" AND deleted_at IS NULL AND branch_id = ?`, [req.session.user.branchId]);
        res.json({ savingsWithdrawn: result[0].savingsWithdrawn });
    } catch (error) {
        console.error('Error fetching savings withdrawn:', error);
        res.status(500).json({ message: 'Failed to fetch savings withdrawn.' });
    }
});

export default router;
