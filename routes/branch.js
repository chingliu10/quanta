import express from 'express';
import flash from 'connect-flash';
import { 
    getBranches ,
    createNewBranch,
    getBranchDetails,
    addUserToBranch,
    deleteBranch,
    removeUserFromBranch,
    findBranch,
    getBranchName,
    checkBranchNameExists,
    updateBranch
} from '../controllers/branchController.js';

import { getAllUsers } from '../helpers/generalHelper.js';

const router = express.Router();

router.use(express.json());



//change branch
router.get("/change", async (req, res) => {
    try {

        const result = await getBranches();

        if(result.queryStatus) {

          return   res.render("branch_change", { branches: result.data , user: req.session.user })

        }

        res.status(400).render("error_page", { message : result.activity  })

    }catch (error) {

        res.status(500).render("error_page", { message : "Something Went Wrong While trying to change branch"})

    }
   
})

router.post("/change", async (req, res) => {
    
    const {  branch_id } = req.body
    try {

        const result = await findBranch(branch_id)
        if(result.queryStatus) {

            req.session.user.branchId = result.data.id 
            req.session.user.branchName = result.data.name
            req.flash('success', 'Branch Changed Successfully');
            return res.redirect("/branch/change")
        }

        res.status(400).render("error_page", { message : result.activity  })        

    }catch (error) {
        
        res.status(500).render("error_page", { message : "Something Went Wrong When Changing Branch"  })
    }
})

// Route to view branches
router.get('/view', async (req, res) => {
    try {
        const result = await getBranches();

        if (result.queryStatus) {
            console.log(result);
            return res.render('branch_list', { branches: result.data, user: req.session.user });
        }
        
        res.status(400).render("error_page", { message : result.activity  })

    } catch (error) {

        res.status(500).render("error_page", { message : "Something Went Wrong When Viewing Branches"  })

    }
});


//route for adding new branch
router.get("/add", (req, res) => {
    res.render("branch_create", { user : req.session.user});
})

router.post("/add", async (req, res) => {
    //adding 
    const { branch_name } = req.body

    try {

        const result = await createNewBranch(branch_name)

        if(result.queryStatus) {
            req.flash('success', 'Branch was added successfully');
            return res.redirect("/branch/view")
        }


        if(!result.queryStatus && result.message == "Branch name already exists." ){
            req.flash('warning', 'Branch name already exists.');
            return res.redirect("/branch/view")
        }


        // Handle the case where branch details are not found
        return res.status(400).render('error_page', { 
            message: result.activity || 'Failed to add branch' 
        });

    }catch (error) {

        return res.status(500).render('error_page', { 
            message: 'Failed to add branch'  
        });

    }
 })



// Route to view details of a specific branch
router.get('/details/:id', async (req, res) => {
    const { id } = req.params;

    try {

        const result = await getBranchDetails(id);
        const users = await getAllUsers();

        if (result.queryStatus) {

            return res.render('branch_details', {
                users : users.data, 
                branch_name : result.data[0].branch_name,
                branch_id : result.data[0].branch_id,
                branch_users : result.data, 
                user: req.session.user 
            });
        }


        if(!result.queryStatus && result.message == "No users") {

            return res.render('branch_details',{

                users : users.data, 
                user: req.session.user,
                branch_name : result.data[0].branch_name,
                branch_id : result.data[0].branch_id,

            })
        }

        // Handle the case where branch details are not found
        return res.status(400).render('error_page', { 
            message: result.activity || 'Failed To Get Branch Details' 
        });

    } catch (error) {
        console.error('Error fetching branch details:', error);
        return res.status(500).render('error_page', { 
            message: 'An unexpected error occurred while fetching branch details.' 
        });
    }
});



//delete branch
router.get("/delete/:branchId", async (req, res) => {

    const { branchId } = req.params

    try {

        const result = await deleteBranch(branchId)

        if(result.queryStatus) {

            req.flash('success', `${result.message}`)
            return res.redirect(`/branch/view`)

        }

        return res.status(400).render('error_page', { 
            message: result.activity || "Failed to delete branch" 
        });

    }catch (error) {

        return res.status(500).render('error_page', { 
            message: 'An unexpected error occurred while Deleting branch' 
        });

    }

})

router.post('/details/:id/add_user', async (req, res) => {
    const { id: branchId } = req.params;
    const { userId } = req.body;

    try {
      
        const result = await addUserToBranch(branchId, userId);

        if(result.queryStatus) {
           req.flash('success', 'User successfully assigned to branch');
           return res.redirect(`/branch/details/${branchId}`)
        }

        if(!result.queryStatus && result.message == "User does exist in this branch" ) {
           req.flash('warning', 'User already exists in this branch')
           return res.redirect(`/branch/details/${branchId}`)
        }

    
        // Handle the case where branch details are not found
        return res.status(400).render('error_page', { 
            message: result.activity || 'Failed to add user to branch.' 
        });


    } catch (error) {
        console.error('Error adding user to branch:', error);
        return res.status(500).render('error_page', { 
            message: 'Failed to add user to branch.' 
        });
    }
});


router.get("/:branchId/remove/user/:userId", async (req, res) => {

    const {  branchId , userId } = req.params;


    try {


        const result = await removeUserFromBranch(branchId , userId);

        if(result.queryStatus) {

              req.flash("success", `User has being removed from branch`);
              return  res.redirect(`/branch/details/${branchId}`);

        }

        if(!result.queryStatus && result.message == "User Not Found") {

            req.flash("warning", "User not found")
            return  res.redirect(`/branch/details/${branchId}`);
        }


        return res.status(400).render('error_page', {
            message : result.activity || "Failed to remove user"
        })

    }catch (error) {

        return res.status(500).render('error_page', {
            message : "Failed to remove user"
        })

    }

        
});


router.get("/edit/:branchId", async (req, res) => {

    const { branchId } = req.params

    try {

        const result = await getBranchName(branchId);

        if(result.queryStatus) {


           return res.render("branch_update" , { 
                title : `Edit Branch `,
                user: req.session.user,
                branch : result.data
            })
        }

        return res.status(400).render('error_page', {
            message : result.activity || "Failed To Get Branch Name"
        })

    }catch (error) {

        return res.status(500).render('error_page', {
            message : "Failed To Get Branch Name"
        })

    }
})

// routes/branchRoutes.js
router.post("/update/:branchId", async (req, res) => {
    const { branchId } = req.params;
    const { name } = req.body;


    try {


        // Check if the name is already in use by another branch
        const result = await checkBranchNameExists(name, branchId);

        if (result.message == "Branch Does Exist") {
            req.flash("warning", result.message)
            return res.redirect(`/branch/edit/${branchId}`);
        }


        if(!result.queryStatus) {

            return res.status(400).render('error_page', { 
                message: "Failed To Check Branch Name" 
            });

        }

        // Update the branch name
        const updateResult = await updateBranch(branchId, name.trim());
        
        if (updateResult.queryStatus) {
            // Redirect to branch list with success message
            req.flash("success", updateResult.message)
            return res.redirect('/branch/view');
        }

        return res.status(400).render('error_page', { 
            message: updateResult.activity || "Failed to update branch" 
        });

    } catch (error) {
        console.error('Error updating branch:', error);
        return res.status(500).render('error_page', { 
            message: "An error occurred while updating the branch" 
        });
    }
});


export default router;
