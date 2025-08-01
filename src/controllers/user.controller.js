import { asyncHandler } from "../utils/asyncHandler.js";
import ApiErrors from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

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


    // get user details from front end - in this file
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);

    // validation - not empty - in same file
    if (!fullName || !username || !email || !password) {
        throw new ApiErrors(400, "Please fill all the fields");
    }

    // check if user already exists: username, email - in same file
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiErrors(409, "User already exists with this username or email");
    }

    // check for images, check for avatar and cover image - in routes file and same file too
    // upload them to cloudinary - in same file
    let avatar = null;
    let coverImage = null;

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (avatarLocalPath) {
        const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
        if (uploadedAvatar?.url) {
            avatar = uploadedAvatar.url;
        }
    }

    if (coverImageLocalPath) {
        const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (uploadedCoverImage?.url) {
            coverImage = uploadedCoverImage.url;
        }
    }

    // create user object - create entry in db
    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar,
        coverImage
    });

    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // check for user creation
    if (!createdUser) {
        throw new ApiErrors(500, "User creation failed");
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

export { registerUser };
