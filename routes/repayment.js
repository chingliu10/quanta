import express from 'express';
import {
    getAllRepayments
} from '../controllers/repaymentController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { getloanPaymentMethods } from '../helpers/generalHelper.js';

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

        if(result.queryStatus) {
           return     res.render("repayment_add", {
                title : "Add Repayment",
                paymentMethods : result.data,
                loanId : id
            })
        }

        req.flash('warning', 'Internal server error while viewing repayment');
        return res.redirect(req.get('Referrer') || "/");

    }catch (error) {

        req.flash('warning', 'Internal server error while viewing repayment');
        return res.redirect(req.get('Referrer') || "/");

    }

})

export default router;