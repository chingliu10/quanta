import express from 'express';
import {
    getAllLoans,
    getArrearsLoans,
    getPendingLoans,
    createLoanProduct,
    getAllLoansProducts,
    getBorrowerDetails,
    getAllBorrowers,
    insertPendingLoan
} from "../controllers/loanContoller.js"
import  handleError  from '../helpers/handleError.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';


const router = express.Router();
router.use(express.json());
router.use(isAuthenticated)

router.get('/all', async (req, res) => {
    try {
        const result = await getAllLoans(req.session.user.branchId);

        if (result.queryStatus) {
            return res.render('loan_list', { loans: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
        const err = handleError(error, 'fetching all loans');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});

// // Route to fetch due loans
router.get('/arrears', async (req, res) => {
    try {
        const result = await getArrearsLoans(req.session.user.branchId);

        if (result.queryStatus) {
            return res.render('loan_due', { loans: result.data, user: req.session.user });
        }

        req.session.error = result.message;
        res.redirect('/dashboard');
    } catch (error) {
        const err = handleError(error, 'fetching due loans');
        req.session.error = err.message;
        res.redirect('/dashboard');
    }
});


router.get("/pending", async (req, res) => {

    res.send("dsfsdfsfsdfsfs")

    // try {

    //     const result = await getPendingLoans(req.session.user.branchId);

    //     if(result.queryStatus) {

    //         res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

    //     }

    //     res.status(400).render("error_page", { message : result.activity  })  


    // }catch (error) {


    //     res.status(500).render("error_page", { message : result.activity  })  

    // }


})

router.get("/pending", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})


router.get("/awaiting_disbursement", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})


router.get("/closed", async (req, res) => {

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })  


    }catch (error) {


        res.status(500).render("error_page", { message : result.activity  })  

    }

})


router.get("/products", async (req, res) => {

    try {

        let result = await getAllLoansProducts();

        if(result.queryStatus) {

          return  res.render("loan_products", { title : "Loan Products", user : req.session.user  , data : result.data })

        }

        res.status(400).render("error_page", { message : result.activity  }) 

    }catch (error) {


        res.status(500).render("error_page", { message : "Failed TO Get Loan Products"  })

    }


})

router.get("/loan_product_create", (req, res) => {
    res.render("loan_product_create", {  title : "Create Loan Product", user : req.session.user  } )
})

router.post("/loan_product_create", async (req, res) => {

    try {

        let result = await createLoanProduct(req.body)

        if(result.message == "found") {

            req.flash("warning", "Loan Product Name Does Exist")
            return res.redirect(`/loan/loan_product_create`)
        }

        if(result.message == "done") {

            req.flash("success", "Loan Product Created")
            return res.redirect("/loan/products")
        }

        res.status(400).render("error_page", { message : result.activity  })  

    }catch (error) {

        
        res.status(500).render("error_page", { message : "Failed To Create Loan Product" })  

    }



})


//route to add loan
router.get("/add/:borrowerId?", async (req, res) => {

    let { borrowerId } = req.params
    //get borrowers or single borrower
    let loanProducts = await getAllLoansProducts()

    if(borrowerId) {
        
        let borrower = await getBorrowerDetails(borrowerId)
        return res.render("loan_add", {  
            title : "Add Loan", 
            user : req.session.user , 
            loanProducts , 
            borrowerId ,
            borrower : borrower.data[0]
          })
        //get single borrower detail
    }else{

        let borrowers = await getAllBorrowers()
        return res.render("loan_add", {  
            title : "Add Loan", 
            user : req.session.user ,
            loanProducts , 
            borrowers : borrowers.data })

    }



})


router.post("/add", async (req, res) => {
    console.log("platinum symbian cargo")
    console.log(req.body)
    try {

        let result = await insertPendingLoan(req.session.user.id, req.session.user.branchId , req.body)

    }catch (error) {

    }
})


// router.get("/pending", async (req, res) => {

//     res.send("dfsfsdfsd")

// })

export default router;
