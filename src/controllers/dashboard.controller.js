
import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiErrors from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Get channel stats: total views, subscribers, videos, likes
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiErrors(400, "Invalid channelId")
    }

    // total videos
    const totalVideos = await Video.countDocuments({ owner: channelId })

    // total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId })

    // total views
    const totalViewsAgg = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ])
    const totalViews = totalViewsAgg[0]?.totalViews || 0

    // total likes (on videos of this channel)
    const channelVideos = await Video.find({ owner: channelId }).select("_id")
    const videoIds = channelVideos.map(v => v._id)
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalVideos,
            totalSubscribers,
            totalViews,
            totalLikes
        }, "Channel stats fetched successfully"))
})

// Get all videos of a channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiErrors(400, "Invalid channelId")
    }

    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 })

    if (!videos || videos.length === 0) {
        throw new ApiErrors(404, "No videos found for this channel")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}
