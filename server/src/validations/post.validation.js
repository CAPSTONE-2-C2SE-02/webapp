import * as yup from "yup";
import Visibility from "../enums/visibility.enum.js";

const postSchema = yup.object({

    hashtag: yup
        .array()
        .of(yup.string())
        .default([]),

    content: yup
        .array()
        .of(yup.string().min(10, "Each content item must be at least 10 characters"))
        .min(1, "Content is required")
        .default([]),

    location: yup
        .string()
        .nullable(),

    imageUrls: yup
        .array()
        .of(yup.string().url("Each image URL must be a valid URL"))
        .default([]),

    likes: yup
        .array()
        .of(yup.string())
        .default([]),

    activeComment: yup
        .boolean()
        .default(true),

    tourAttachment: yup
        .string()
        .nullable(),

    sharedFrom: yup
        .string()
        .nullable(),

    caption: yup
        .string()
        .default(""),
});

export default postSchema;
