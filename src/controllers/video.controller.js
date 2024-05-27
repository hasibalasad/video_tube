import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
        throw new ApiError(400, "video id is not valid");
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
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
