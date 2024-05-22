import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
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

router.route("/user").post(verifyJWT, getCurrentUser);

router.route("/updateaccountdetails").post(verifyJWT, updateAccountDetails);

router
    .route("/updateuseravatar")
    .post(upload.single("avatar"), verifyJWT, updateUserAvatar);
router
    .route("/updateusercoverimage")
    .post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/:username").post(verifyJWT, getUserChannelProfile);

export default router;
