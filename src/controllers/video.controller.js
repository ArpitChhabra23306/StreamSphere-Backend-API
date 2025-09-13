import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body;
    if(title, description){
        throw new ApiError(400, "Title and description are required");
    }

    //taking files from multer from route callback
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    //checking if file is present or not
    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    //uploading on cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    //checking upload success
    if(!videoFile?.url || !thumbnail?.url){
        throw new ApiError(500, "Error in uploading files, please try again");
    }

    //creating video document in database
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id //from JWT
    });

    // sending response
    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}