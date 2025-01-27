import express from 'express';
import loanRoute from "./loan.js"
import repaymentRoute from "./repayment.js"
import borrowerRoute from "./borrower.js"
import {
    getTotalCapital
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

        return res.status(500).json({ error : "Failed To Get Capital/Api/r" })

    }
})

export default router;