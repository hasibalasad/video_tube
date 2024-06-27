import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel not found");
    }

    // const channelSubscribers = await User.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(channelId),
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "subscriptions",
    //             localField: "_id",
    //             foreignField: "channel",
    //             as: "subscribers",
    //         },
    //     },
    //     {
    //         $addFields: {
    //             subscribers: "$subscribers.subscriber",
    //             subscribersCount: { $size: "$subscribers" },
    //         },
    //     },
    //     {
    //         $project: {
    //             username: 1,
    //             subscribers: 1,
    //             subscribersCount: 1,
    //         },
    //     },
    // ]);

    const channelSubscribers = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },

        {
            $lookup: {
                from: "users",
                localField: "subscribers.subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },

        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                subscribers: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelSubscribers[0],
                "subscribers fetched successfully",
            ),
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "channel not found");
    }

    const subscribedToChannels = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribedTo.channel",
                foreignField: "_id",
                as: "subscribedTo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedToChannels[0],
                "subscribeTo fetched successfully",
            ),
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
