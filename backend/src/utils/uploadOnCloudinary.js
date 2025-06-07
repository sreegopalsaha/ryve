import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';

export const uploadOnCloudinay = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new ApiError(400, "No file path provided");
        }

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Upload with retry mechanism
        let uploadResult;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                uploadResult = await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto",
                    folder: "ryve/profile_pictures", // Organize uploads in folders
                    transformation: [
                        { width: 500, height: 500, crop: "fill" }, // Resize and crop
                        { quality: "auto" } // Optimize quality
                    ]
                });
                break; // Success, exit retry loop
            } catch (uploadError) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw uploadError; // Throw if all retries failed
                }
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            }
        }

        // Clean up local file
        try {
            fs.unlinkSync(localFilePath);
        } catch (cleanupError) {
            console.error("Error cleaning up local file:", cleanupError);
            // Don't throw here, as the upload was successful
        }

        return uploadResult.url;

    } catch (error) {
        // Clean up local file if it exists
        try {
            if (localFilePath && fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (cleanupError) {
            console.error("Error cleaning up local file:", cleanupError);
        }

        // Throw a more specific error
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to upload file: ${error.message}`);
    }
};