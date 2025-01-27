import express from 'express';
import {
    insertBank,
    getAllBanks,
    getBankDetails,
    changeBankDetails,
    deleteBank,
    addCapital,
    getAllCapitalDeposits,
    deleteDeposit,
    getCapitalDepositDetail,
 } from '../controllers/capitalController.js';
import handleError from '../helpers/handleError.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
const router = express.Router();

router.use(express.json());
router.use(isAuthenticated)

//get all capital
router.get("/data", async (req, res) => {
    try {

        let result = await getAllCapitalDeposits(req.session.user.branchId)

        if(result.queryStatus) {

           return res.render("capital_list", {  title : "All Capital", user : req.session.user , deposits : result.data } )

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch(error) {

        res.status(400).render("error_page", { message : "Failed To Get Capital Deposits/r" })        

    }
    
})

//delete capital
router.post("/delete", async (req, res) => {
    
    try {

        let result = await deleteDeposit( req.body.deposit_id )

        if(result.queryStatus){

            req.flash("success", "Capital Deleted Successfully")
            return res.redirect(`/capital/data`)

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Delete Deposit/r" })

    }

})

//were capital is added
router.get("/add", async (req, res) => {
    try{

        let result = await getAllBanks()

        if(result.queryStatus) {
            return  res.render("capital_add" , {  title : "Add Capital", user : req.session.user, banks : result.data  } )
        }

         res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Get Banks Capital" })

    }
    
})

//were capital is deposited
router.post("/add", async (req, res) => {

    let { id, branchId } = req.session.user

    try {

        let result = await addCapital(id, branchId, req.body)

        if(result.queryStatus) {

            req.flash("success", "Capital Added Successfully")
            return res.redirect(`/capital/data`)

        }

        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Deposit Capital" })

    }

})

//edit capital
router.get("/edit/:capitalId", async (req, res) => {

    let { capitalId } = req.params

    try {

        let result = await getCapitalDepositDetail(capitalId)

        if(result.queryStatus) {


            let result2 = await getAllBanks()

            if(result2.queryStatus) {

                console.log(result.data)
                console.log(result2.data)
                return res.render("capital_edit", {
                    title : "Edit Capital Deposit", 
                    user : req.session.user,
                    capitalDetail : result.data[0],
                    bank_accounts : "[ { id: 3, name: 'CRDB' }, { id: 4, name: 'STANDARD CHARTERED' } ]"
                })

            }

            return  res.status(400).render("error_page", { message : result2.activity })

        }

        return  res.status(400).render("error_page", { message : result.activity })

    }catch (error) {


        res.status(500).render("error_page", { message : "Failed To Edit Capital Deposit/r" })
    }

})


router.get("/bank/add", (req, res) => {

         res.render("capital_add_bank", {  title : "Add Bank", user : req.session.user } )
 
})

//get all banks
router.get("/bank/data", async (req, res) => {

    try {

        let result = await getAllBanks()

        if(result.queryStatus) {
            return res.render("capital_bank_list", {  title : "Add Bank", user : req.session.user , banks : result.data } )
        }
        
        res.status(400).render("error_page", { message : result.activity })

    }catch (error) {
        
        res.status(500).render("error_page", { message : "Failed To Get Banks!" })

    }
    
})

//add new bank
router.post("/bank/add", async (req, res) => {
    let {bank_name} = req.body

    try {

        let result = await insertBank(bank_name)

        if(result.message == "found") {

            req.flash("warning", "Bank Does Exist")
            return res.redirect(`/capital/bank/add`)

        }

        if(result.message == "done") {

            req.flash("success", "Bank Added Successfully")
            return res.redirect(`/capital/bank/data`)

        }

        res.status(400).render("error_page", { message : result.activity  })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Add Bank Account!" })

    }
})

router.get("/bank/edit/:bankId", async (req, res) => {

    let { bankId } = req.params

    try {

        let result = await getBankDetails(bankId)

        if(result.queryStatus) {
            return res.render("capital_edit_bank",{  title : `Edit Bank ${result.data.name}`, user : req.session.user , bank : result.data })
        }

        res.status(400).render("error_page", { message : result.activity  })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To View Bank!" })
    }


})

//edit bank details
router.post("/bank/edit", async (req, res) => {

    try {

        let result = await changeBankDetails(req.body)

        if(result.message == "found") {

            req.flash("warning", "Bank Does Exist")
            return res.redirect(`/capital/bank/edit/${req.body.bank_id}`)

        }

        if(result.message == "done") {

            req.flash("success", "Bank Editted Successfully")
            return res.redirect(`/capital/bank/data`)

        }

        res.status(400).render("error_page", { message : result.activity  })

    }catch (e) {

        res.status(500).render("error_page", { message : "Failed To Edit Bank/r" })

    }

})

//delete bank
router.post("/bank/delete", async (req, res) => {

    let { bank_id } = req.body

    try {
        let result = await deleteBank(bank_id)

        if(result.queryStatus) {

            req.flash("success", "Bank Deleted Successfully")
            return res.redirect(`/capital/bank/data`)

        }

        res.status(400).render("error_page", { message : result.activity  })
    }catch(error) {
        res.status(500).render("error_page", { message : "Failed To Delete Bank/r" })
    }

})


export default router;