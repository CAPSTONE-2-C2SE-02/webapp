import * as yup from "yup";
import Visibility from "../enums/visibility.enum.js";

const postSchema = yup.object({
    hashtag: yup.array().of(yup.string()).default([]),
    taggedUser: yup.array().of(yup.string()).default([]),
    content: yup.string().min(10, "Content must be at least 10 characters")
        .when("sharedFrom", {
            is: (value) => !value,
            then: (schema) => schema.required("Content is required"),
            otherwise: (schema) => schema.nullable(),
        }),
    location: yup.string().nullable(),
    mediaUrls: yup.array().of(yup.string().url("Each media URL must be a valid URL")).default([]),
    visibility: yup.string().oneOf(Object.values(Visibility), "Invalid visibility option").default(Visibility.PUBLIC),
    activeComment: yup.boolean().default(true),
    tourId: yup.string().nullable(),
    sharedFrom: yup.string().nullable(),
});

export default postSchema;
