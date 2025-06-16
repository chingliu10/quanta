import express from 'express';
import {
    getAllRepayments
} from '../controllers/repaymentController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { getloanPaymentMethods } from '../helpers/generalHelper.js';
import { getLoanMinimalDetailsForRepaymentPurposes   } from '../controllers/loanContoller.js';
import { insertRepayment } from '../controllers/repaymentController.js';

const router = express.Router();

router.use(isAuthenticated)
router.use(express.json());


router.get("/all", async (req, res) => {

    try {

        let result = await getAllRepayments(req.session.user.branchId);

        if(result.queryStatus) {


            return    res.render("repayment_list", { title : "Repayments list" , repayments : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {

        res.status(500).render("error_page", { message : result.activity  })  
    }

})


router.get("/add/:id", async (req, res) => {

    try {

        let { id } = req.params
        let result = await getloanPaymentMethods()
        let loanDetails = await getLoanMinimalDetailsForRepaymentPurposes(id)

        console.log(loanDetails)

        if(result.queryStatus && loanDetails.queryStatus) {
           return     res.render("repayment_add", {
                title : "Add Repayment",
                paymentMethods : result.data,
                loanId : id,
                loanDetails : loanDetails.data
            })
        }

        req.flash('warning', 'Internal server error while viewing repayment');
        return res.redirect(req.get('Referrer') || "/");

    }catch (error) {

        req.flash('warning', 'Internal server error while viewing repayment');
        return res.redirect(req.get('Referrer') || "/");

    }

})


router.post("/store", async (req, res) => {


    let {  loan_id , borrower, repayment_amount, repayment_method, repayment_date, notes } = req.body
    try {

        let result = await insertRepayment(loan_id, borrower, req.session.user.id, 
            repayment_amount, repayment_method, repayment_date, notes, req.session.user.branchId
        )

        if(result.queryStatus) {

            req.flash('success', 'Repayment Was Added');
            return res.redirect(`/loan/details/${loan_id}`)

        }

        req.flash('warning', 'Repayment Failed');
        return res.redirect(req.get('Referrer') || "/");

    }catch (error) {

        console.log(error)
        req.flash('warning', 'Repayment Failed');
        return res.redirect(req.get('Referrer') || "/");

    }


})

export default router;