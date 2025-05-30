import express from 'express';
import {
    getAllIncomeTypes,
    storeIncomeType,
    storeIncome,
    getAllIncomes,
    getIncomeById,
    updateIncome,
    softDeleteIncome
} from '../controllers/incomeController.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.use(express.json());
router.use(isAuthenticated)

//all incomes
router.get("/all", async (req, res) => {
    try {

        let result = await getAllIncomes(req.session.user.branchId)
        console.log(result)

        if(result.queryStatus) {

            return res.render("income_list", { title : "All Income" , user : req.session.user , incomes : result.data })

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Fetch Income Add Route/r" })

    }
})

//add income 
router.get("/add", async (req, res) => {
    try {

        let result = await getAllIncomeTypes(req.session.user.branchId)

        if(result.queryStatus) {

            return res.render("income_add", { title : "Add Income" , user : req.session.user , incomeTypes : result.data })

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Fetch Income Add Route/r" })

    }
})

//storeIncome
router.post("/add", async (req, res) => {

    
    try {

        let result = await storeIncome(req.body, req.session.user.branchId)

        if(result.queryStatus) {

            req.flash("success", "Income Added Successfully")
            return res.redirect(`/income/all`)

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Add Income/r" })

    }

})

//view all income types
router.get("/type/all", async (req, res) => {

    try {

        let result = await getAllIncomeTypes(req.session.user.branchId)

        if(result.queryStatus) {

            return res.render("income_type_list", { title : "All Income Types" , user : req.session.user , incomeTypes : result.data })

        }

        res.status(400).render("error_page", { message : result.activity })


    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Get Income Types/r" })

    }
    
})

router.get("/type/add", async (req, res) => {
    res.render("income_type_add", { title : "Add Income Type" , user : req.session.user })
})

router.post("/type/add", async (req, res) => {

    try {

        let { income_type_add } = req.body

        let result = await storeIncomeType(income_type_add, req.session.user.branchId )

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


router.get("/edit/:incomeId", async (req, res) => {

    let id = req.params.incomeId

    try {

        let income = await getIncomeById(id)
        let incomeTypes = await getAllIncomeTypes()

        if(income.queryStatus && incomeTypes.queryStatus) {

            return res.render("income_edit", { title : "All Income" , user : req.session.user , income : income.data , incomeTypes : incomeTypes.data})           

        }


        res.status(400).render("error_page", { message : "Failed To View Income" })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To View Income" })

    }

})


router.post("/update", async (req, res) => {

    const { income_id, income_type, amount, income_date, notes } = req.body;
    console.log(req.body)
    const branch = req.session.user.branchId;

    try {

        const result = await updateIncome({ income_id, income_type, amount, income_date, notes }, branch);

        if (result.queryStatus) {
            req.flash("success", "Income Updated Successfully");
            return res.redirect("/income/all");
        }

        res.status(400).render("error_page", { message: result.activity });

    } catch (error) {

        console.log(error)
        res.status(500).render("error_page", { message: "Failed To Update Income/c" });

    }
});



router.post("/delete/:id", async (req, res) => {
    const { id } = req.params;
    // or however you store the branch
    try {
        await softDeleteIncome(id);
        req.flash("success", "Income deleted successfully.");
        res.redirect("/income/all")
    } catch (error) {

        req.flash("warning", "Failed to delete income.");
        res.redirect("back");
        // res.status(500).render("error_page", { message: "Failed To Delete Income/c" });
    }
});



export default router;