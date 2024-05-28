import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import extractPublicIdFromUrl from "../utils/deleteFromCloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    // get video, upload to cloudinary, create video

    // get video title and description
    const { title, description } = req.body;

    // check if title is provided
    if (!title) {
        throw new ApiError(400, "title is required");
    }

    // get video file and thumbnail
    const videoFile = req.files?.videoFile[0];
    const thumbnail = req.files?.thumbnail[0];

    // check if validate video file and thumbnail are provided
    if (!(videoFile && thumbnail)) {
        throw new ApiError(400, "Video file and thumbnail are required.");
    }

    // get video file local path
    const videoFileLocalPath = videoFile?.path;

    // check if video file local path is provided
    if (!videoFileLocalPath) {
        throw new ApiError(500, "video local path is missing");
    }

    // upload video on cloudinary
    const videoCloudinaryRes = await uploadOnCloudinary(videoFileLocalPath);

    // check if video cloudinary response is provided
    if (!videoCloudinaryRes) {
        throw new ApiError(500, "ERROR: while oploading video on cloudinary");
    }
    const { url, duration } = videoCloudinaryRes;

    // upload thumbnail on cloudinary
    const thumbnailCloudinaryRes = await uploadOnCloudinary(thumbnail?.path);
    if (!thumbnailCloudinaryRes) {
        throw new ApiError(
            500,
            "ERROR: while oploading thumbanail on cloudinary",
        );
    }

    // const user = await User.findById(req?.user._id);

    // create video in db
    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: url,
        thumbnail: thumbnailCloudinaryRes?.url,
        owner: req.user?._id,
    });
    return res
        .status(200)
        .json(new ApiResponse(200, video, "video added successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    // get video by id
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(401, "video not found");
    }

    if (video.isPublished === false) {
        throw new ApiError(401, "video is not published");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    // update video details like title, description, thumbnail
    const { videoId } = req.params;
    if (!videoId) throw new ApiError(400, "video id is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(401, "video not found");

    const { title, description } = req.body;
    if (title) video.title = title;
    if (description) video.description = description;

    const thumbnailLocalPath = req?.file?.path;

    if (!(title || description || thumbnailLocalPath)) {
        throw new ApiError(400, "need a field to update video");
    }
    if (thumbnailLocalPath) {
        const resOfCloudinary = await uploadOnCloudinary(thumbnailLocalPath);
        if (!resOfCloudinary)
            throw new ApiError(
                500,
                "ERROR: while uploading thumbnail on cloudinary",
            );
        video.thumbnail = resOfCloudinary.url;
    }

    await video.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    // delete video
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "video id is required");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(500, "Error while deleting the video");
    }
    // how to delete from cloudinary
    if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile, "video");
    }
    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "video id is required");
    }

    const video = await Video.findById(videoId).select("isPublished");
    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    //another way to toggle publish status
    // const video = await Video.findByIdAndUpdate(
    //     videoId,
    //     [
    //         {
    //             $set: {
    //                 isPublished: {
    //                     $not: "$isPublished",
    //                 },
    //             },
    //         },
    //     ],
    //     {
    //         new: true,
    //     },
    // ).select("isPublished");

    if (!video) {
        throw new ApiError(500, "Error while toggling the publish status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video publish status is updated"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
