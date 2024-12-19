import express from 'express';
import {
    getSavingsAccounts,
    getSavingsForm,
    storeSavingsAccount,
    getSavingsTransactions,
    storeSavingsProduct,
    getSavingsProducts
} from '../controllers/savingController.js';
import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());

// View Savings Accounts
router.get('/accounts/view', async (req, res) => {
    try {
        const result = await getSavingsAccounts();

        if (result.queryStatus) {
            return res.render('savings_accounts', { savings: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching savings accounts');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// Add Savings Account Form
router.get('/accounts/add', async (req, res) => {
    try {
        const result = await getSavingsForm();

        if (result.queryStatus) {
            return res.render('savings_add', {
                borrowers: result.data.borrowers,
                savings_products: result.data.savingsProducts,
                user: req.session.user,
            });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'loading savings account creation form');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// Store Savings Account
router.post('/accounts/store', async (req, res) => {
    try {
        // Call the controller to store the savings account
        const result = await storeSavingsAccount(req.body);

        // Handle the response from the controller
        if (result.queryStatus) {
            // Success: Set a success message and redirect to the accounts view page
            req.session.success = result.message;
            return res.redirect('/savings/accounts/view');
        }

        // Failure: Set an error message and redirect to the add account page
        req.session.error = result.message;
        return res.redirect('/savings/accounts/add');
    } catch (error) {
        // Handle unexpected errors
        const err = handleError(error, 'storing savings account');
        req.session.error = err.message;
        return res.redirect('/savings/accounts/add');
    }
});



// View Savings Transactions
router.get('/transactions/data', async (req, res) => {
    try {
        const result = await getSavingsTransactions();

        if (result.queryStatus) {
            return res.render('savings_transactions', { transactions: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching savings transactions');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});


// Add Savings Product Form
router.get('/products/create', async (req, res) => {
    try {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        res.render('savings_product_add', { days,  user: req.session.user });
    } catch (error) {

        console.log(error)
        const err = handleError(error, 'loading savings product creation form');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});


// Store Savings Product
router.post('/products/store', async (req, res) => {
    try {
        const result = await storeSavingsProduct(req.body);
        if (result.queryStatus) {
            req.session.success = result.message;
            return res.redirect('/savings/products/view');
        }
        req.session.error = result.message;
        res.redirect('/savings/products/add');
    } catch (error) {
        const err = handleError(error, 'storing savings product');
        req.session.error = err.message;
        res.redirect('/savings/products/add');
    }
});

// View Savings Products
router.get('/products/view', async (req, res) => {
    try {
        const result = await getSavingsProducts();

        if (result.queryStatus) {
            return res.render('savings_products', { savingsProducts: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching savings products');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

export default router;
