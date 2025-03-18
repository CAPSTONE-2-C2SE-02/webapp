import cloudinary from '../config/cloudinary.config.js';

export const uploadImage = async (images) => {

    try {
        const uploadPromises = images.map(img =>
            cloudinary.uploader.upload(img.path)
        );

        const results = await Promise.all(uploadPromises);
        return results.map(result => result.secure_url);

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: error.message
        })
    }
};