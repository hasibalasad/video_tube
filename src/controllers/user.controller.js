import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token",
        );
    }
};

const registerUser = asyncHandler(async function (req, res) {
    // get user details from frontend.
    // validation: check for empty field.
    // check for avatar, coverImage or other files
    // check if the user already exist : username,email
    //upload them to cloudinary , get filepath
    //create user object , create entry in db.
    // check for created user.
    //send response

    //?check for empty field
    const { username, email, password, fullName } = req.body;
    /* using map() : [username, email, password, fullName].map((field) => field?.trim() === "").includes(true) */
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === "", // trim() to ensure leading and trailing whitespace is removed.
        )
    ) {
        throw new ApiError(400, " All fields are required");
    }

    //? check for existing user
    const existingUser = await User.findOne({
        $or: [{ username }, { password }],
    });
    if (existingUser) {
        throw new ApiError(409, "User with email or password is already exist");
    }

    //? checking for files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required");
    }

    //Upload on cloudinary
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarResponse) {
        throw new ApiError(400, "avatar file is required");
    }

    //create user object
    const user = await User.create({
        username,
        email,
        fullName,
        password,
        avatar: avatarResponse.url,
        coverImage: coverImageResponse?.url || "",
    });

    // user without password and refressToken field
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user..",
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully"),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    //get data from frontend
    //check for empty field
    // find for user
    // compare password with found user
    // generate access and refresh token and save refresh token in db
    // send response

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "email and password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid user credentails");
    }

    // console.log(user._id.toString());
    const tokens = await generateAccessAndRefereshTokens(user._id);
    // console.log(tokens);
    const { accessToken, refreshToken } = tokens;

    // dont give user refresh token and password
    const userDataTosend = await User.findById(user._id).select(
        "-password -refreshToken",
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: userDataTosend,
                    accessToken, // frontend developer might need these tokens for storage or for mobile
                    refreshToken,
                },
                "User logged in Successfully",
            ),
        );
});

export { registerUser, loginUser };
