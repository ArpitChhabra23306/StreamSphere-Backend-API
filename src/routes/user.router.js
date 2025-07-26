import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"; // Assuming multer is used for file uploads

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1 // Limit to one avatar image
        },
        {
            name: "coverImage",
            maxCount: 1 
        },
        {}
    ]),
    registerUser
) // http://localhost:8000/api/v1/users/register


export default router;
