import cloudinary from '../config/cloudinary.config.js';

export const uploadImages = async (images) => {
    try {
        if (!images || images.length === 0) {
            throw new Error("No images provided.");
        }

        const uploadPromises = images.map(img =>
            cloudinary.uploader.upload(img.path)
        );

        const results = await Promise.all(uploadPromises);
        return results.map(result => result.secure_url);

    } catch (error) {
        throw new Error(error.message);
    }
};

export const uploadSingleImage = async (image) => {
    try {
        if (!image) {
            throw new Error("No image provided.");
        }

        const result = await cloudinary.uploader.upload(image[0].path);
        return result.secure_url;

    } catch (error) {
        throw new Error(error.message);
    }
};
