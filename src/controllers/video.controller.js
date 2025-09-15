import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import ApiErrors from "../utils/ApiErrors.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // Build filter
    let filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" }; // search in title (case-insensitive)
    }
    if (userId) {
        filter.owner = userId; // filter by user if provided
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    // Fetch paginated videos
    const videos = await Video.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username email avatar"); // include basic user details

    const totalVideos = await Video.countDocuments(filter);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            videos,
            pagination: {
                total: totalVideos,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalVideos / limit),
            }
        }, "Videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiErrors(400, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiErrors(400, "Video file and thumbnail are required");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile?.url || !thumbnail?.url) {
        throw new ApiErrors(500, "Error in uploading files, please try again");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration || 0, // fallback if duration not returned
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiErrors(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiErrors(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // 1. Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiErrors(404, "Video not found");
    }

    // 2. Ensure only the owner can update
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to update this video");
    }

    // 3. Update title and description directly
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiErrors(404, "Video not found");
    }

    // 2. Ensure only the owner can delete
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to delete this video");
    }   

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));    
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiErrors(404, "Video not found");
    }

    // 2. Ensure only the owner can delete
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiErrors(403, "You are not authorized to delete this video");
    }   

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};