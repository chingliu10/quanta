import express from 'express';
const router = express.Router();

import { getBorrowerRepayments } from "../controllers/repaymentApiController.js"


router.use(express.json());


router.get("/get_borrower_repayments/:borrowerId", async (req, res) => {

    try {

        const result = await getBorrowerRepayments(req.params.borrowerId);

        if(result.queryStatus) {

            return  res.status(200).json({ repayments  : result })

        }

        res.status(400).json({
            status : false,
            message : "Query Encountered An Error Getting Borrower Repayments"
        })
       
    }catch (error) {

        console.log(error)
        
        res.status(500).json({
            status : false,
            message : "Server Encounteres An Error Getting Borrower Repayments"
        })


    }

})

export default router;