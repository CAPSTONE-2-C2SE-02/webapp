import express from 'express';
import { StatusCodes } from "http-status-codes";

import cloudinary from '../config/cloudinary.config.js';
import upload from '../middlewares/multer.middleware.js';

const uploadRouter = express.Router();

uploadRouter.post("/file", upload.single("image"), (req, res) => {
    cloudinary.uploader.upload(req.file.path, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Error uploading" });
        }
        res.status(StatusCodes.CREATED).json({ message: "Image uploaded successfully", data: result });
    })
});

export default uploadRouter;