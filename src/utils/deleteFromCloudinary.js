// http://res.cloudinary.com/devhdgm2l/video/upload/v1716899913/qolcx72lcluci8gyrcoq.mp4
import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (url, resource_type) => {
    if (!(url && resource_type)) return null;
    const public_id = url.split("/").pop().split(".")[0];

    try {
        await cloudinary.uploader.destroy(public_id, {
            resource_type: resource_type,
        });
    } catch (error) {
        throw new ApiError(
            500,
            "Error while deleting the video from Cloudinary",
        );
    }
};

export default deleteFromCloudinary;
