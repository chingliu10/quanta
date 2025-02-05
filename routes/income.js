import express from 'express';
import {
    storeIncomeType
} from '../controllers/incomeController.js';
import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());

//all incomes
router.get("/view", async (req, res) => {
    res.send("all incomes")
})

//view all income types
router.get("/type/all", async (req, res) => {
    res.render("income_type_list")
})

router.get("/type/add", async (req, res) => {
    res.render("income_type_add")
})

router.post("/type/add", async (req, res) => {

    try {

        let { income_type_add } = req.body

        let result = await storeIncomeType(income_type_add)

        if(result.queryStatus) {
            
            req.flash("success", "Type Created Successfully")
            return res.redirect(`/income/type/all`)

        }

        //duplicate entry
        if(result.errorInformation.errorNo === 1062) {


            req.flash("warning", "Duplicate Entry")
            return res.redirect(`/income/type/add`)

        }
        
        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Create Income Type" })

    }

})



export default router;