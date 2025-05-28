import express from 'express';
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
    getExpenseTypes ,
} from "../controllers/expenseController.js"
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { deleteExpenseType ,getExpenseTypeById, updateExpenseType } from '../models/expense_type_model.js';
import { createExpense, getAllExpenses } from '../models/expense.js';

// Reconstruct __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target path: assets/receipts
const receiptDir = path.join(__dirname, "..", "assets", "receipts");

// Ensure the receipts directory exists
if (!fs.existsSync(receiptDir)) {
  fs.mkdirSync(receiptDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptDir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitized}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

const router = express.Router();
// For parsing application/x-www-form-urlencoded (e.g., non-file form posts)
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(isAuthenticated)
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
        res.redirect("/expense/type/view")

    }
})


router.get("/type/edit/:id", async (req, res) => {
    try {

        console.log(req.params.id)
        let expenseType = await getExpenseTypeById(req.params.id)
        console.log(expenseType)
        res.render("expense_type_edit", { title : `Edit Expense ${expenseType.name}` 
                , user : req.session.user , expenseType  })

    }catch(e) {

        res.status(500).render("error_page", { message : "Failed To Edit Expense" })

    }
})

router.post("/type/update", async (req, res) => {
    
    let { expense_id , expense_type_name } = req.body

    try {

       let result = await updateExpenseType(expense_id, expense_type_name)

       if(result.msg !== 'Done') {

            req.flash("warning", `${result.msg}`)
            return  res.redirect(`/expense/type/edit/${expense_id}`)

       }

            req.flash("success", "Expense Type Editted Successfully")
            res.redirect("/expense/type/view")


    }catch (e) {


        res.status(500).render("error_page", { message : "Failed To Update Expense" })

    }
})


//expenses route are below

router.get("/add", async (req, res) => {

    try {

        let expenseTypes = await getExpenseTypes()
        res.render("expense_add", { title : "Add Epenses" , user : req.session.user , types : expenseTypes.data })
        
    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Open Add Expense Page" })

    }

})

//view all expenses
router.get("/view", async (req, res) => {

    try {

        let expenses = await getAllExpenses()
        console.log(expenses)
        res.render("expense_view", { title : "Add Epenses" , user : req.session.user , expenses })
        
    }catch (error) {
        console.log(error)
        res.status(500).render("error_page", { message : "Failed To Open Add Expense Page" })

    }

})

//post expense 


router.post("/add", upload.single("receipt"), async (req, res) => {

    
  try {

    let user_id = req.session.user.id ,
        branch_id = req.session.user.branchId 

    const {
      expense_type,     // can be renamed to expense_type_id below
      amount,
      date,
      description,      // assuming this maps to notes
    } = req.body;

    const receipt = req.file;

    const expenseData = {
      expense_type_id: expense_type,
      amount,
      date,
      user_id,
      branch_id,
      notes: description,
      files: receipt ? [receipt.filename] : null // store as array for JSON string
    };

    const newExpense = await createExpense(expenseData);

    req.flash("success", "Expense Added Successfully")
    res.redirect("/expense/view")

  } catch (err) {

     res.status(500).render("error_page", { message : "Failed To Add Expense" })

  }
});

export default router;