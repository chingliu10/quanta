import express from 'express';
import {
    getAllPayrolls,
    getEmployees,
    storePayroll,
    getPayrollById,
    deletePayroll
} from '../controllers/payrollController.js';
import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());

// View Payrolls
router.get('/view', async (req, res) => {
    try {
        const result = await getAllPayrolls();

        console.log(result)
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
             req.flash("success", "Payroll Added Successfully")
            return res.redirect('/payroll/view');
        }

        req.flash("warning", "Failed To Add Payroll")
        return res.redirect('/payroll/add');
    } catch (error) {
        const err = handleError(error, 'storing payroll');
        req.flash("warning", `${err.message}`)
        return res.redirect('/payroll/add');
    }
});


router.post("/delete/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await deletePayroll(id);
        if (!result.queryStatus) {
            req.flash('warning', 'Internal server error while deleting payroll.');
            return res.redirect('back');
        }

        req.flash("success", "Payroll Deleted Successfully")
        return res.redirect('/payroll/view');

    } catch (error) {

         req.flash('warning', 'Internal server error while deleting payroll.');
         return res.redirect('back');

    }
});

// Payroll slip view
router.get('/slip/:id', async (req, res) => {
    try {
        const result = await getPayrollById(req.params.id);
        if (!result.queryStatus) {
            return res.status(404).render('404', { message: result.message || 'Payroll not found' });
        }

        res.render('payroll_slip', { layout: false, payroll: result.data, user: req.session.user });
    } catch (error) {
        const err = handleError(error, 'fetching payroll slip');
        res.status(500).render('500', { message: err.message });
    }
});



export default router;
