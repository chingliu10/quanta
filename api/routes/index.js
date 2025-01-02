import express from 'express';
import loanRoute from "./loan.js"
const router = express.Router();

router.use(express.json());

router.use("/loan", loanRoute)
export default router;