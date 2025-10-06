
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiErrors from "../utils/ApiErrors.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiErrors(400, "Invalid channelId")
    }

    // prevent user from subscribing to themselves
    if (req.user._id.equals(channelId)) {
        throw new ApiErrors(400, "You cannot subscribe to yourself")
    }

    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    })

    if (existingSub) {
        // unsubscribe
        await Subscription.findByIdAndDelete(existingSub._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"))
    }

    // subscribe
    const newSub = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, { subscribed: true, subscription: newSub }, "Subscribed successfully"))
})


// Get list of subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiErrors(400, "Invalid channelId")
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})


// Get list of channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiErrors(400, "Invalid subscriberId")
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
