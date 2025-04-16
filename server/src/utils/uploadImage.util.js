import cloudinary from '../config/cloudinary.config.js';
import sharp from 'sharp';
import fs from 'fs';

export const uploadImages = async (images) => {
    try {
        if (!images || images.length === 0) {
            return [];
        }

        const uploadPromises = images.map(async (img) => {
            // Zip the image before uploading
            const maxSizeKB = 500;
            const maxSizeBytes = maxSizeKB * 1024;
            let quality = 90;
            let compressedBuffer = await sharp(img.path)
                .jpeg({ quality })
                .toBuffer();

            // Decrease quality to reach desired size
            while (compressedBuffer.length > maxSizeBytes && quality > 10) {
                quality -= 10;
                compressedBuffer = await sharp(img.path)
                    .jpeg({ quality })
                    .toBuffer();
            }

            // Create a temporary file to upload
            const tempFilePath = `temp_compressed_${Date.now()}.jpg`;
            fs.writeFileSync(tempFilePath, compressedBuffer);

            try {
                const result = await cloudinary.uploader.upload(tempFilePath);

                // Delete temporary file after uploading
                fs.unlinkSync(tempFilePath);

                return result.secure_url;
            } catch (error) {
                fs.unlinkSync(tempFilePath);
                throw error;
            }
        });

        const results = await Promise.all(uploadPromises);
        return results;

    } catch (error) {
        throw new Error(error.message);
    }
};

export const uploadSingleImage = async (image) => {
    try {
        if (!image) {
            throw new Error("No image provided.");
        }

        // Zip the image before uploading
        const maxSizeKB = 500;
        const maxSizeBytes = maxSizeKB * 1024;
        let quality = 90;
        let compressedBuffer = await sharp(image[0].path)
            .jpeg({ quality })
            .toBuffer();

        // Decrease quality to reach desired size
        while (compressedBuffer.length > maxSizeBytes && quality > 10) {
            quality -= 10;
            compressedBuffer = await sharp(image[0].path)
                .jpeg({ quality })
                .toBuffer();
        }

        // Create a temporary file to upload
        const tempFilePath = `temp_compressed_${Date.now()}.jpg`;
        fs.writeFileSync(tempFilePath, compressedBuffer);

        try {
            const result = await cloudinary.uploader.upload(tempFilePath);

            // Delete temporary file after uploading
            fs.unlinkSync(tempFilePath);

            return result.secure_url;
        } catch (error) {
            fs.unlinkSync(tempFilePath);
            throw error;
        }

    } catch (error) {
        throw new Error(error.message);
    }
};