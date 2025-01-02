import express from 'express';
const router = express.Router();
import { getBorrowerLoans } from '../controllers/loanApiController.js';

router.use(express.json());


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

export default router;