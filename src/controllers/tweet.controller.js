import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import ApiErrors from "../utils/ApiErrors.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    //validating content
    if(!content || content.trim() === ""){
        throw new ApiErrors(400, "Tweet content cannot be empty");
    }

    if (!req.user?._id) {
        throw new ApiErrors(401, "Unauthorized, please login first");
    }
        
    //create tweet
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiErrors(400, "Invalid user ID");
    }

    // check if user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiErrors(404, "User not found");
    }

    // find tweets of the user
    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 }) // newest first
        .populate("owner", "username avatar"); // optional: populate basic user info

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});


const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;

    //validating content
    if(!content || content.trim() === ""){
        throw new ApiErrors(400, "Tweet content cannot be empty");
    }

    // validating tweetId
    if(!isValidObjectId(tweetId)){
        throw new ApiErrors(400, "Invalid tweetId");
    }

    // check if tweet exists
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiErrors(404, "Tweet not found");
    }

    // check if the logged in user is the owner of the tweet
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiErrors(403, "You are not authorized to update this tweet");
    }

    // update tweet
    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    );

    return res
    .status(200)
    .json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;

    // validating tweetId
    if(!isValidObjectId(tweetId)){
        throw new ApiErrors(400, "Invalid tweetId");
    }   

    // check if tweet exists
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiErrors(404, "Tweet not found");
    }

    // check if the logged in user is the owner of the tweet
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiErrors(403, "You are not authorized to delete this tweet");
    }

    // delete tweet
    await Tweet.findByIdAndDelete(tweetId); 

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}