import express from 'express';
// import {

// } from '../controllers/userController.js';
// import handleError from '../helpers/handleError.js';

const router = express.Router();

router.use(express.json());


router.get("/add", async (req, res) => {
    res.send("tiger woods")
})


export default router;