import * as yup from "yup";

const commentSchema = yup.object({
    postId: yup
        .string()
        .required("Post ID is required"),
    content: yup
        .string()
        .trim()
        .min(1, "Comment must have at least 1 character")
        .max(500, "Comment cannot exceed 500 characters")
        .required("Content is required"),
    parentComment: yup
        .string()
        .nullable()
        .notRequired(),
});

export default commentSchema;
