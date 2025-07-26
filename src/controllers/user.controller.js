import { asyncHandler } from "../utils/asyncHandler.js";
import ApiErrors from "../utils/ApiErrors.js";
import {User} from "../models/user.model.js"; // Assuming you have a User model defined
import {uploadOnCloudinary} from "../utils/cloudinary.js"; // Importing the upload function from cloudinary utility
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    // Logic for registering a user
    
    // get user details from front end - in this file
    // validation - not empty - in same file
    // check if user already exists: username, email - in same file
    // check for images, check for avatar and cover image - in routes file and same file too
    // upload them to cloudnary - in same file
    // create user object - create entry in db
    // remove passwrod and refresh token fro response
    // check for user creatinn
    // return response


    //getting details from user, from form or json
    const {username,fullName,email,password} = req.body
    console.log("email: ", email);

    // Validating user details
    if(fullName === "" || username === "" || email === "" || password === "") {
        throw new ApiErrors(400, "Please fill all the fields");
    }

    // Check if user already exists
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser) {
        throw new ApiErrors(409, "User already exists with this username or email");
    }

    // Check for images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath) {
        throw new ApiErrors(400, "Please upload avatar"); //coverimage is not that important so we are not writing for it.
    }

    // Upload images to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
         throw new ApiErrors(400, "Please upload avatar");
    }

    // Create user object and save to database
    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatar.url, // Assuming the upload function returns an object with a url property
        coverImage: coverImage ? coverImage.url : null // Cover image is optional
    })

    // Check if user is created successfully and removing password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken"); // Exclude password and refreshToken from response
    if(!createdUser) {
        throw new ApiErrors(500, "User creation failed");
    }

    //return resp
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );    // 201 is for created, 200 is for success
    
})


export { registerUser };
// This code defines a controller function for registering a user. It uses the `asyncHandler` utility to handle asynchronous operations and errors. When the function is called, it responds with a success message indicating that the user has been registered successfully. This is a basic implementation and can be expanded with actual registration logic, such as saving user data to a database.