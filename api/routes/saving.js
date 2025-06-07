import express from 'express';
const router = express.Router();
import {
    totalSavingsDeposits,
    totalSavingsWithdrawn
} from '../../helpers/generalHelper.js';

router.use(express.json());

import { verifyToken } from '../../middlewares/verifyToken.js';

//get total capital


router.use(verifyToken)


router.get("/total_savings_deposited", async (req, res) => {

    try {

        let { start_date , end_date } = req.query

        let { branchId } = req.session.user

        // let result = await totalPrincipalReleased(branchId)

        if(start_date && end_date) {

            let result = await totalSavingsDeposits(start_date, end_date, branchId)

            if(result.queryStatus) {

                return res.json({ data : result.data })

            }

            return res.status(500).json({ error : result.activity })

        }

        let result2 = await totalSavingsDeposits(undefined,undefined, branchId)

        if(result2.queryStatus) {

            return res.json({ data : result2.data })

        }

        return res.status(500).json({ error : result2.activity })

        

    }catch (error) {

        console.log(error)
        res.status(500).json({ error : "Failed To Get Savings Deposited/Api/r" })

    }

})


router.get("/total_savings_withdrawn", async (req, res) => {

    try {

        let { start_date , end_date } = req.query

        let { branchId } = req.session.user

        // let result = await totalPrincipalReleased(branchId)

        if(start_date && end_date) {

            let result = await totalSavingsWithdrawn(start_date, end_date, branchId)

            if(result.queryStatus) {

                return res.json({ data : result.data })

            }

            return res.status(500).json({ error : result.activity })

        }

        let result2 = await totalSavingsWithdrawn(undefined,undefined, branchId)

        if(result2.queryStatus) {

            return res.json({ data : result2.data })

        }

        return res.status(500).json({ error : result2.activity })

        

    }catch (error) {

        console.log(error)
        res.status(500).json({ error : "Failed To Get Savings Withdrawn/Api/r" })

    }

})


export default router;