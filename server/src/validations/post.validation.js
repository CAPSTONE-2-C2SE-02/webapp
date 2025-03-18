import * as yup from "yup";
import Visibility from "../enums/visibility.enum.js";

const postSchema = yup.object({
    profileId: yup.string().required("Author ID is required"),
    hashtag: yup.string().nullable(),
    taggedUser: yup.array().of(yup.string()).default([]),
    content: yup.string().min(10, "Content must be at least 10 characters").required("Content is required"),
    location: yup.string().nullable(),
    mediaUrls: yup.array().of(yup.string().url("Each media URL must be a valid URL")).default([]),
    visibility: yup.string().oneOf(Object.values(Visibility), "Invalid visibility option").default(Visibility.PUBLIC),
    activeComment: yup.boolean().default(true),
});

export default postSchema;
