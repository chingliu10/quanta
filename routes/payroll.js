import express from 'express';
import {
    getAllPayrolls,
    getEmployees,
    storePayroll
} from '../controllers/payrollController.js';
import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());

// View Payrolls
router.get('/view', async (req, res) => {
    try {
        const result = await getAllPayrolls();

        if (result.queryStatus) {
            return res.render('payroll_view', { payrolls: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching payrolls');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// Add Payroll Form
router.get('/add', async (req, res) => {
    try {
        const result = await getEmployees();

        if (result.queryStatus) {
            return res.render('payroll_add', { users: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'loading add payroll form');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// Store Payroll
router.post('/store', async (req, res) => {
    try {
        const result = await storePayroll(req.body);

        if (result.queryStatus) {
            req.session.success = result.message;
            return res.redirect('/payroll/view');
        }

        req.session.error = result.message;
        return res.redirect('/payroll/add');
    } catch (error) {
        const err = handleError(error, 'storing payroll');
        req.session.error = err.message;
        return res.redirect('/payroll/add');
    }
});

export default router;
