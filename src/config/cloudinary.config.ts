/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { StatusCodes } from "http-status-codes";
import config from ".";
import AppError from "../app/errors/AppError";

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name as string,
    api_key: config.cloudinary.api_key as string,
    api_secret: config.cloudinary.api_secret as string
})

export const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
        const match = url.match(regex);

        console.log({match});

        if(match && match[1]){
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id);
            console.log(`File ${public_id} is deleted from cloudinary.`);
        }

    } catch (error: any) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Cloudinary image deletion failed", error.message)
    }
}








export const cloudinaryUpload = cloudinary;