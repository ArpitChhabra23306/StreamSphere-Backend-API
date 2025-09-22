import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import ApiErrors, {ApiError} from "../utils/ApiErrors.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user._id;

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(400, "Invalid video ID");
    } 

    const existingLike = await Like.findOne({ user: userId, video: videoId });
    if(existingLike){
        existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const newLike = await Like.create({ user: userId, video: videoId });
    return res.status(201).json(new ApiResponse(201, newLike, "Video liked successfully"));

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id;

    if(!isValidObjectId(commentId)){
        throw new ApiErrors(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({user: userId, comment: commentId});
    if(existingLike){
        existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    await Like.create({user: userId, comment: commentId});
    return res.status(201).json(new ApiResponse(201, null, "Comment liked successfully"));

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res.status(200).json(new ApiResponse(200, "Tweet unliked", { liked: false }));
    }

    await Like.create({ tweet: tweetId, likedBy: userId });
    return res.status(200).json(new ApiResponse(200, "Tweet liked", { liked: true }));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likes = await Like.find({ likedBy: userId, video: { $ne: null } }).populate("video");

    const videos = likes.map(like => like.video);

    return res.status(200).json(new ApiResponse(200, "Liked videos fetched", { videos }));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};

