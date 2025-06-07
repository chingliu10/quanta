import express from 'express';
const router = express.Router();
import { getBorrowerLoans } from '../controllers/loanApiController.js';
import {
    totalPrincipalReleased
} from '../../helpers/generalHelper.js';
router.use(express.json());

import { verifyToken } from '../../middlewares/verifyToken.js';

//get total capital
router.use(verifyToken)

router.get("/get_borrower_loans/:borrowerId", async (req, res) => {

        const { borrowerId } = req.params

        try {

            const result = await getBorrowerLoans(borrowerId)

            if(result.queryStatus) {
              return  res.status(200).json({ loans  : result }) 
            }

            res.status(400).json({
                status : false,
                message : "Query Encountered An Error Getting Borrower Loans"
            })

        }catch (error) {

            res.status(500).json({
                status : false,
                message : "Server Encounteres An Error Getting Borrower Loans"
            })

        }

})


router.get("/total_principal_released", async (req, res) => {

    try {

        let { start_date , end_date } = req.query

        let { branchId } = req.session.user

        // let result = await totalPrincipalReleased(branchId)

        if(start_date && end_date) {

            let result = await totalPrincipalReleased(start_date, end_date, branchId)

            if(result.queryStatus) {

                return res.json({ data : result.data })

            }

            return res.status(500).json({ error : result.activity })

        }

        let result2 = await totalPrincipalReleased(undefined,undefined, branchId)

        if(result2.queryStatus) {

            return res.json({ data : result2.data })

        }

        return res.status(500).json({ error : result2.activity })

        

    }catch (error) {

        res.status(500).json({ error : "Failed To Get Total Principal Released/Api/r" })

    }

})

export default router;