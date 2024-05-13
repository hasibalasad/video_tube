import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const registerUser = asyncHandler(async function (req, res) {
    const { username, email, password, fullName } = req.body;

    //check for empty field
    // trim() to ensure leading and trailing whitespace is removed

    /* using map() : [username, email, password, fullName].map((field) => field?.trim() === "").includes(true) */
    if (
        [username, email, password, fullName].some(
            (field) => field?.trim() === "",
        )
    ) {
        throw new ApiError(400, " All fields are required");
    }
    // console.log(req.files["avatar"][0]);
    res.send(req.body);
});

export { registerUser };
