import express from 'express';
import loanRoute from "./loan.js"
import repaymentRoute from "./repayment.js"
import borrowerRoute from "./borrower.js"
const router = express.Router();

router.use(express.json());

router.use("/loan", loanRoute)
router.use("/repayment", repaymentRoute)
router.use("/borrower", borrowerRoute)

export default router;