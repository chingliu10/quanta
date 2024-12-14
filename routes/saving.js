import express from 'express';
import {
    getSavingsAccounts
} from "../controllers/savingController.js"
import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());

// Route to fetch and display savings accounts
router.get("/accounts/view", async (req, res) => {
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

export default router;
