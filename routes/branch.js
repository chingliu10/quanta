import express from 'express';
import flash from 'connect-flash';
import { 
    getBranches ,
    getBranchDetails,
    addUserToBranch,
} from '../controllers/branchController.js';

import { getAllUsers } from '../helpers/generalHelper.js';

const router = express.Router();

router.use(express.json());

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

        // Handle the case where branch details are not found
        return res.status(404).render('error_page', { 
            message: result.activity || 'Failed To Get Branch Details' 
        });

    } catch (error) {
        console.error('Error fetching branch details:', error);
        return res.status(500).render('error_page', { 
            message: 'An unexpected error occurred while fetching branch details.' 
        });
    }
});



router.post('/details/:id/add_user', async (req, res) => {
    const { id: branchId } = req.params;
    const { userId } = req.body;

    try {
      
        console.log("sdfksdfksdbfkbsdfkusbufdbuksfkusbfskudbfskbdf")
        const result = await addUserToBranch(branchId, userId);

        if(result.queryStatus) {
           req.flash('success', 'User successfully assigned to branch');
           return res.redirect(`/branch/details/${branchId}`)
        }

        if(!result.queryStatus && result.message == "User does exist in this branch" ) {
            console.log("session below")
            console.log(req.session)
          console.log(req.flash('warning', 'User already exists in this branch'));
           return res.redirect(`/branch/details/${branchId}`)
        }

    
        // Handle the case where branch details are not found
        return res.status(404).render('error_page', { 
            message: result.activity || 'Failed to add user to branch.' 
        });


    } catch (error) {
        console.error('Error adding user to branch:', error);
        return res.status(500).render('error_page', { 
            message: 'Failed to add user to branch.' 
        });
    }
});


export default router;
