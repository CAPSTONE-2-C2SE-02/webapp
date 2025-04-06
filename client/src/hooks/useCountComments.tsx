import { Comment } from "@/lib/types";
import { useMemo } from "react";

export default function useCountComments(comments: Comment[]) {
  const totalComments = useMemo(() => {
    const countAllComments = (comments: Comment[]): number => {
      return comments.reduce((acc, comment) => {
        const childCount = comment.childComments?.length
          ? countAllComments(comment.childComments)
          : 0;
        return acc + 1 + childCount;
      }, 0);
    };

    return countAllComments(comments);
  }, [comments]);

  return totalComments;
}