import * as yup from "yup";

const commentSchema = yup.object({
    postId: yup.string().required("Post ID is required"),
    content: yup.string().trim().min(1).max(500).required("Content is required"),
    parentComment: yup.string().nullable(),
});

export default commentSchema;
