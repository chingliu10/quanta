import express from 'express';
const router = express.Router();
import {
    getTotalCapital
} from '../../helpers/generalHelper.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

//get total capital


router.use(verifyToken)
router.get("/get_total_capital", async (req, res) => {

    let { start_date , end_date } = req.query

    let branchId = req.user.branchId;
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


export default router;