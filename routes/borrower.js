import express from 'express';
import {
    getAllBorrowers,
    addBorrower,
    getEditBorrower,
    updateBorrower,
    getBorrowerDetails,
    deleteBorrower
} from '../controllers/borrowerController.js';


const router = express.Router();



router.use(express.json())
// Routes for Borrowers
// 1. Get all borrowers
router.get('/view', async (req, res) => {
    try {
        const borrowers = await getAllBorrowers(); // Fetch data from the controller
        console.log(borrowers)
        res.render('borrowersdata', { borrowers , user: req.session.user }); // Render the view with data
    } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching borrowers'); // Handle errors
    }
});



router.get('/add', (req, res) => {
    res.render('borrower_create', { user : req.session.user })
})

// 3. Add a new borrower
router.post('/add', async (req, res) => {
    try {

        const insertBorrower = await addBorrower(req.body)

        console.log("dfsdfkbfskdf fdsjfsd")
        console.log(insertBorrower)

        if(insertBorrower.message == "Borrower already exists") {
            res.redirect("/borrower/add")
        }

        if(insertBorrower.message = "success" && insertBorrower.queryStatus == true) {

            res.redirect("/borrower/view")

        }

        
        //

    }catch (error) {

    }
});

//edit borrower
router.get('/edit/:id', async (req, res) => {


    try {

        let result =  await getEditBorrower(req.params.id);
        res.render('borrower_update', { borrower: result.data , user: req.session.user });


    }catch (error) {

    }
   
});

router.post('/edit/:id', async (req, res) => {
    try {


        console.log("updating borrower")

        let result = await updateBorrower(req.params.id, req.body);

        if(result.message = "success" && result.queryStatus == true) {

            res.redirect("/borrower/view")

        }

        //else there was an error at updateBorrower()

    }catch (error) {



    }
});



// view borrower by id
router.get('/details/:id', async (req, res) => {

    try {


        let result = await getBorrowerDetails(req.params.id);


        console.log(result);

        if(result.message = "success" && result.queryStatus == true) {

            res.render("borrower_details", { borrower: result.data , user: req.session.user })

        }

        //else there was an error at updateBorrower()

    }catch (error) {



    }

} );


// // 5. Delete a borrower by ID
router.get('/delete/:id', async (req, res) => {
    try{

        
        let result = await deleteBorrower(req.params.id);


        console.log(result);

        if(result.message = "success" && result.queryStatus == true) {

            res.redirect("/borrower/view")

        }

    }catch (error) {

    }
} );


export default router;
