import { Post } from "@/lib/types";
import { Link } from "react-router";

interface PostSearchItemProps {
  post: Post;
}

const PostSearchItem = ({ post }: PostSearchItemProps) => {
  const author = post.createdBy;
  return (
    <Link to={`/${author.username}/post/${post._id}`} prefetch="intent">
      <div className="bg-white hover:bg-gray-100 p-2 rounded-md flex items-center gap-3 w-full">
        <div className="w-10 h-10 rounded-md border overflow-hidden flex-shrink-0">
          <img src={author.profilePicture} alt={author.fullName} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-start gap-0 flex-1">
          {post.content && <h5 className="font-medium text-xs text-primary line-clamp-1">{post.content[0]}</h5>}
          {post.hashtag && post.hashtag.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtag.map((hashtag) => (
                <span key={hashtag} className="font-normal text-xs text-gray-400">{hashtag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default PostSearchItem