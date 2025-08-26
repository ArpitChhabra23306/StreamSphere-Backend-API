import { asyncHandler } from "../utils/asyncHandler.js";
import ApiErrors from "../utils/ApiErrors.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWt = asyncHandler( async(req, res, next) => {
    try {
        const authHeader = req.header("Authorization") || "";
        const token = req.cookies?.accessToken || authHeader.replace(/^Bearer\s+/i, "");

    
        if (!token) {
            throw new ApiErrors(401, "Access token is missing or invalid");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken") //using _id beacuse we are using _id in token while making it
    
        if(!user) {
            throw new ApiErrors(404, "User not found");
        }
    
        req.user = user; // attach user to request object
        next(); // proceed to the next middleware or route handler

    } catch (error) {
        throw new ApiErrors(401, "Invalid access token");
    }
});
