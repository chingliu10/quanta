import express from 'express';
import {
    getAllLoans,
    getArrearsLoans,
    getPendingLoans
} from "../controllers/loanContoller.js"
import  handleError  from '../helpers/handleError.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { title } from 'process';

const router = express.Router();

router.use(isAuthenticated)
router.use(express.json());



router.get('/all', async (req, res) => {
    try {
        const result = await getAllLoans(req.session.user.branchId);

        if (result.queryStatus) {
            return res.render('loan_list', { loans: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
        const err = handleError(error, 'fetching all loans');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// // Route to fetch due loans
router.get('/arrears', async (req, res) => {
    try {
        const result = await getArrearsLoans(req.session.user.branchId);

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


router.get("/pending", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }


})

router.get("/pending", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})


router.get("/awaiting_disbursement", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})


router.get("/closed", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})

export default router;
