import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //taking coment and video from req
    const {videoId} = req.params;
    const {content} =req.body;

    //validating comment
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment content cannot be empty");
    } //validation format of coming videoId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    //chceking video exists or not in database
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    //creating the comment
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id //from JWT
    });

    return res
        .status(201)
        .json(new ApiResponse(201,comment,"Comment added successfully"));

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}