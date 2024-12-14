import express from 'express';
import {
    getAllLoans,
    getArrearsLoans
} from "../controllers/loanContoller.js"
import  handleError  from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());



router.get('/all', async (req, res) => {
    try {
        const result = await getAllLoans();

        if (result.queryStatus) {
            return res.render('loan_list', { loans: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching all loans');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// // Route to fetch due loans
router.get('/arrears', async (req, res) => {
    try {
        const result = await getArrearsLoans();

        if (result.queryStatus) {
            return res.render('loan_due', { loans: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching due loans');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

export default router;
