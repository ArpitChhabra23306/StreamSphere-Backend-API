import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"; // Assuming multer is used for file uploads
import { verifyJWt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1 
        }
    ]),
    registerUser
);
// http://localhost:8000/api/v1/users/register


router.route("/login").post(loginUser);


router.route("/logout").post(verifyJWt, logoutUser); //thats why next was used in auth middleware, so after its completing we can move to logoutUser controller

console.log("User router executing");

export default router;
