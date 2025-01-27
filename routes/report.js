import express from 'express';
// import {

// } from '../controllers/userController.js';
// import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());


router.get("/cashflow", async (req, res) => {
    res.render("report_cash_flow")
})


export default router;