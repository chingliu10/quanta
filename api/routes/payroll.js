import express from 'express';
const router = express.Router();

import { getTotalPayroll } from '../../helpers/generalHelper.js';
import { verifyToken } from '../../middlewares/verifyToken.js';

router.use(express.json());
router.use(verifyToken);

// Get total payroll
router.get("/total_payroll", async (req, res) => {
    try {
        let { start_date, end_date } = req.query;
        let { branchId } = req.session.user;

        let result;

        if (start_date && end_date) {
            result = await getTotalPayroll(start_date, end_date, branchId);
        } else {
            result = await getTotalPayroll(undefined, undefined, branchId);
        }

        if (result.queryStatus) {
            return res.json({ data: result.data });
        }

        return res.status(500).json({ error: result.activity });

    } catch (error) {
        res.status(500).json({ error: "Server Error While Getting Total Payroll" });
    }
});

export default router;
