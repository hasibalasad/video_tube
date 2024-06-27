import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.post("/register", registerUser);
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
);

router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshtoken").post(refreshAccessToken);

router.route("/changepassword").post(verifyJWT, changeCurrentPassword);

router.route("/currentuser").get(verifyJWT, getCurrentUser);

router.route("/updateaccountdetails").patch(verifyJWT, updateAccountDetails);

router
    .route("/updateuseravatar")
    .patch(upload.single("avatar"), verifyJWT, updateUserAvatar);
router
    .route("/updateusercoverimage")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watchhistory").get(verifyJWT, getWatchHistory);

export default router;
