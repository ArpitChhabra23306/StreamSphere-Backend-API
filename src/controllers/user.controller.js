import { asyncHandler } from "../utils/asyncHandler.js";
import ApiErrors from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens = async(userId) =>
{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken; // Save the refresh token in the user document, on database
        await user.save({ validateBeforeSave: false }); // Save the user document with the new refresh token

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiErrors(500, "Error generating tokens");
    }
}



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
    // remove passwrod and refresh token from response
    // check for user creation
    // return response


    // get user details from front end
    const { fullName, email, username, password } = req.body;
    console.log("email:", email);

    // validation - not empty
    if (!fullName || !username || !email || !password) {
        throw new ApiErrors(400, "Please fill all the fields");
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiErrors(409, "User already exists with this username or email");
    }

    // Initialize variables
    let avatar = null;
    let coverImage = null;

    // Upload avatar if provided
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (avatarLocalPath) {
        const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
        if (uploadedAvatar?.url) {
            avatar = uploadedAvatar.url;
        }
    }

    // Upload cover image if provided
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (coverImageLocalPath) {
        const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (uploadedCoverImage?.url) {
            coverImage = uploadedCoverImage.url;
        }
    }

    // Create user in DB
    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar,
        coverImage
    });

    // Remove sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiErrors(500, "User creation failed");
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});



const loginUser = asyncHandler(async (req, res) => {

    // req body -> data
    // username or email
    // find the user 
    // password check
    // access and refresh token generation
    // send cookies

    const {email,username,password} = req.body;

    if (!email && !username) {
        throw new ApiErrors(400, "Please provide email or username");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] })
    if(!user) {
        throw new ApiErrors(404, "User not found");
    }

    const isPassValid = await user.isPasswordCorrect(password);
    if(!isPassValid) {
        throw new ApiErrors(401, "Invalid password");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggenInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true, // Cookie is not accessible via JavaScript, only sent to the server
        secure: true, // Cookie is only sent over HTTPS
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggenInUser, "User logged in successfully"));

    
});



const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { new: true });

    const options = {
        httpOnly: true, // Cookie is not accessible via JavaScript, only sent to the server
        secure: true, // Cookie is only sent over HTTPS
    }

    return res
        .status(200)
        .cookie("accessToken", options) // Clear the access token cookie
        .cookie("refreshToken", options) // Clear the refresh token cookie
        .json(new ApiResponse(200, null, "User logged out successfully"));

});



const refreshAccessToken = asyncHandler(async (req, res) => {
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(incomingRefreshToken){
        throw new ApiErrors(400, "unauthorized, please login again");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id);
        if(!user) {
            throw new ApiErrors(404, "User not found");
        }
    
        //checking both refresh token from db and incoming refresh token
        if(user.refreshToken !== incomingRefreshToken) {
            throw new ApiErrors(403, "Invalid refresh token");
        }
    
        options = {
            httpOnly: true, // Cookie is not accessible via JavaScript, only sent to the server
            secure: true, // Cookie is only sent over HTTPS
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, null, "Access token refreshed successfully"));   
          
    } catch (error) {
        throw new ApiErrors(403, "Invalid refresh token");
    }  

})



const changeCurreentPassword = asyncHandler(async (req, res) => {
    // req body -> data
    const { oldPassword, newPassword } = req.body; 

    // Validate the input
    const user = await User.findById(req.body?._id)  
    // Check if user exists
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new ApiErrors(400, "Old password is incorrect");
    }

    user.password = newPassword; // Update the password
    await user.save({validateBeforeSave: false}); // Save the updated user document

    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));   

})



const getCurrrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
})



const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body;

    if(!fullName || !email) {
        throw new ApiErrors(400, "Please provide fullname and email");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email
            }
        }, {new: true} //new option returns the updated document
    ).select("-password"); // Exclude sensitive fields from the response

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
})



const updateAvatar = asyncHandler(async (req, res) => {

    // req body -> data
    const avatarLocalPath = req.files?.path
    if (!avatarLocalPath) {
        throw new ApiErrors(400, "avatar file is missing");
    }

    // Upload the avatar to Cloudinary
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    if (!uploadedAvatar?.url) {
        throw new ApiErrors(500, "Failed to upload avatar");
    }

    // Update the user document with the new avatar URL
    const user = await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                avatar: uploadedAvatar.url // Update the avatar URL in the user document
            }
        },{
            new: true // Return the updated user document
        }
    ).select("-password"); // Exclude sensitive fields from the response

    return res.status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
})



const updateCoverImage = asyncHandler(async (req, res) => {

    // req body -> data
    const coverImageLocalPath = req.files?.path
    if (!coverImageLocalPath) {
        throw new ApiErrors(400, "coverImgae file is missing");
    }

    // Upload the avatar to Cloudinary
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!uploadedCoverImage?.url) {
        throw new ApiErrors(500, "Failed to upload coverImage");
    }

    // Update the user document with the new cover image URL
    const user = await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {
                coverImage: uploadedCoverImage.url // Update the avatar URL in the user document
            }
        },{
            new: true // Return the updated user document
        }
    ).select("-password"); // Exclude sensitive fields from the response

    return res.status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
})



const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiErrors(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {$size: "$subscribers"},
                channelSubscribed: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribed: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])

    console.log("channel:", channel);
    if(!channel?.length) {
        throw new ApiErrors(404, "Channel not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
});



export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurreentPassword, getCurrrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelProfile};
