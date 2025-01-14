import express from 'express';
const router = express.Router();
import { getAllBorrowers } from '../controllers/borrowerApiController.js';

router.use(express.json());

router.get("/allborrowers", async (req, res) => {
    try {
        // Get result from controller
        const result = await getAllBorrowers(req.session.user.branchId);
        
        // Check if query was successful
        if (result.queryStatus) {
            // Send successful response
            res.status(200).json({
                queryStatus: true,
                data: result.data
            });
        } else {
            // Send error response if query failed
            res.status(400).json({
                queryStatus: false,
                message: "Failed to fetch borrowers"
            });
        }
    } catch (error) {
        // Send error response for any caught errors
        res.status(500).json({
            queryStatus: false,
            message: "Internal server error while fetching borrowers",
            error: error.message
        });
    }
});

export default router;