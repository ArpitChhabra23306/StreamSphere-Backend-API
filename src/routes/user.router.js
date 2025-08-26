import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurreentPassword, getCurrrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
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


router.route("/refresh-token").post(refreshAccessToken);

router.post("/change-password", verifyJWt, changeCurreentPassword);
router.get("/current-user",verifyJWt, getCurrrentUser);
router.route("/update-account").patch(verifyJWt,updateAccountDetails);
router.route("/avatar").patch(verifyJWt, upload.single("avatar"), updateAvatar);
router.route("/cover-image").patch(verifyJWt, upload.single("coverImage"), updateCoverImage);
router.route("/c/:username").get(verifyJWt,getUserChannelProfile); //c for channel, passing username as param
router.route("/history").get(verifyJWt, getWatchHistory); //to get user watch history

console.log("User router executing");

export default router;
