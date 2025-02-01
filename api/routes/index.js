import express from 'express';
import loanRoute from "./loan.js"
import repaymentRoute from "./repayment.js"
import borrowerRoute from "./borrower.js"
import {
    getTotalCapital,
    totalPrincipalReleased,
    totalSavingsDeposits
} from '../../helpers/generalHelper.js';
import { isAuthenticated } from '../../middlewares/isAuthenticated.js';
const router = express.Router();

router.use(express.json());

router.use("/loan", loanRoute)
router.use("/repayment", repaymentRoute)
router.use("/borrower", borrowerRoute)
router.use(isAuthenticated)


//get total capital
router.get("/get_total_capital", async (req, res) => {

    let { start_date , end_date } = req.query

    let { branchId } = req.session.user

    try {

        let result

        if(start_date && end_date) {

            result = await getTotalCapital(start_date, end_date, branchId)

            if(result.queryStatus) {

                return res.json({ data : result.data })

            }
            
                return res.status(500).json({ error : result.activity })
        }

        result = await getTotalCapital(undefined, undefined, branchId)

        if(result.queryStatus) {
            return res.json({ data : result.data })
        }

        return res.status(500).json({ error : result.activity })

    }catch(error) {

        res.status(500).json({ error : "Failed To Get Capital/Api/r" })

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
        res.status(500).json({ error : "Failed To Get Total Principal Released/Api/r" })

    }

})

export default router;