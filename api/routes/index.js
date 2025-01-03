import express from 'express';
import loanRoute from "./loan.js"
import repaymentRoute from "./repayment.js"
const router = express.Router();

router.use(express.json());

router.use("/loan", loanRoute)
router.use("/repayment", repaymentRoute)
export default router;