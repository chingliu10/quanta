import express from 'express';
import {
    createExpense ,
    getExpenseTypes ,
} from "../controllers/expenseController.js"
import  handleError  from '../helpers/handleError.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { deleteExpenseType } from '../models/expense_type_model.js';

const router = express.Router();
router.use(express.json());
//all incomes
router.get("/type/create", async (req, res) => {
    res.render("expense_type_add", { title : "Add expense Type" , user : req.session.user })
})


router.get("/type/view", async (req, res) => {
    try {

        let result = await getExpenseTypes()
        res.render("expense_type_list", { title : "Expense Types" , user : req.session.user , expenseTypes : result.data })

    }catch (e) {

        res.status(500).render("error_page", { message : "Failed To Get Expense Types" })
        
    }
    
})

router.post("/type/create", async (req, res) => {

    try {
   
    let result =  await createExpense(req.body)



    console.log(result)

    if(result.message == 'Expense type with this name already exists') {

         req.flash("warning", result.message)
         return res.redirect(`/expense/type/create`)

    }

        req.flash("success", "Expense Type Created")
        res.redirect("/expense/type/view")

    }catch (e) {

        res.status(500).render("error_page", { message : "Failed To Create Expense Type/r" })

    }

});


router.post("/type/delete/:id", async (req, res) => {
    try {

        console.log(req.params.id)
        await deleteExpenseType(req.params.id)
        req.flash("success", "Expense Type Deleted")
        res.redirect("/expense/type/view")

    }catch (e) {

        req.flash("warning", "Failed To Delete Expense Type")
        req.redirect("/expense/type/view")

    }
})




export default router;