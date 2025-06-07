import express from 'express';
import loanRoute from "./loan.js"
import repaymentRoute from "./repayment.js"
import borrowerRoute from "./borrower.js"
import capitalRoute from "./capital.js"
import savingsRoute from "./saving.js"
import payrollRoute from "./payroll.js"
import incomeRoute from "./income.js"



const router = express.Router();

router.use(express.json());

router.use("/capital", capitalRoute)
router.use("/loan", loanRoute)
router.use("/repayment", repaymentRoute)
router.use("/borrower", borrowerRoute)
router.use("/saving", savingsRoute)
router.use("/payroll", payrollRoute)
router.use("/income", incomeRoute)





export default router;