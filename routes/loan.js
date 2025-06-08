import express from 'express';
import {
    getAllLoans,
    getArrearsLoans,
    getPendingLoans,
    createLoanProduct,
    getAllLoansProducts,
    getBorrowerDetails,
    getAllBorrowers,
    insertPendingLoan,
    getLoanDetails,
    disburseLoan
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

   

    try {

        const result = await getPendingLoans(req.session.user.branchId);

        if(result.queryStatus) {

            return res.render("loan_pending", { title : "Pending Loans" ,  loans : result.data , user : req.session.user })

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
    try {

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
        }

        if(!borrowerId) {
            let borrowers = await getAllBorrowers()
            return res.render("loan_add", {  
                title : "Add Loan", 
                user : req.session.user ,
                loanProducts , 
                borrowers : borrowers.data })

        }


        
        res.status(400).render("error_page", { message : "Failed To Get Loan Product"  })
       
        

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Get Loan Product"  })

    }



})


router.post("/add", async (req, res) => {
    console.log("platinum symbian cargo")
    console.log(req.body)
    try {

        let result = await insertPendingLoan(req.session.user.id, req.session.user.branchId , req.body)

        if(result.queryStatus) {

           req.flash("success", "Loan Was Added")
           return res.redirect("/loan/pending")
        }

        res.status(400).render("error_page", { message : result.activity  })

    }catch (error) {

        res.status(500).render("error_page", { message : "Failed To Add Loan"  })

    }
})


// router.get("/pending", async (req, res) => {

//     res.send("dfsfsdfsd")

// })


router.get("/details/:loan_id", async (req, res) => {

    let { loan_id } = req.params;

try {
    const result = await getLoanDetails(loan_id);
    console.log(result.data)
    if (!result.queryStatus) {
        // Optional: render an error page or return a 404
        return res.status(404).render('loan_not_found', { message: result.message });
    }

    const loanStatus = result.data.loan.status.toLowerCase();

    if (loanStatus === 'pending') {

        return res.render('loan_details', { data : result.data });
    }

    // if (loanStatus === 'closed' || loanStatus === 'disbursed') {
    //     return res.render('loan_active_or_closed', { data: result.data });
    // }

    // Optional: handle unknown status
    return res.render('loan_details', { data: result.data });

} catch (error) {
    console.error(error);
    res.status(500).render('error_page', { message: 'Internal Server Error' });
}


})



router.post("/approve_loan", async (req, res) => {
    try {
        
        let { 
            id, 
            approved_date, 
            first_repayment_date, 
            approved_amount 
        } = req.body;

        // Validate required fields
        if (!id || !approved_date || !first_repayment_date || !approved_amount) {
            req.flash("warning", "Missing required loan parameters");
            return res.redirect(req.get('Referrer') || "/");
        }

        // Process loan disbursement
        let result = await disburseLoan(
            id,
            approved_date,
            first_repayment_date,
            approved_amount
        );
   
        if (result.queryStatus) {
            req.flash("success", "Loan Disbursed Successfully");
            return res.redirect("/loan/all");
        }
        
        req.flash("warning", "Loan Disbursal Failed: ");
        return res.redirect(req.get('Referrer') || "/");

    } catch (error) {
        console.error("Loan Disbursal Error:", error);
        
        // Use actual error message if available
        const errorMessage = error.message || "Internal server error";
        req.flash("warning", `Loan Disbursal Failed: ${errorMessage}`);
        
        return res.redirect(req.get('Referrer') || "/");
    }
});

export default router;
