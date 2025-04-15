import express from 'express';
import {
    createExpense
} from "../controllers/expenseController.js"
import  handleError  from '../helpers/handleError.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';


const router = express.Router();
router.use(express.json());
//all incomes
router.get("/type/create", async (req, res) => {
    res.render("expense_type_add", { title : "Add expense Type" , user : req.session.user })
})

router.post("/type/add", createExpense);




export default router;