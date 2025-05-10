import { Link } from "react-router";
import { Button } from "../ui/button";
import { Image, Paperclip, MapPin, Smile } from "lucide-react";
import { useState } from "react";
import useAuthInfo from "@/hooks/useAuth";
import CreatePostModal from "../modals/create-post-modal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NewPost = () => {
  const auth = useAuthInfo();
  const [isCreatePostModelOpen, setIsCreatePostModelOpen] = useState(false);

  const showCreatePost = () => {
    setIsCreatePostModelOpen(true);
  }

  return (
    <>
      <div className="py-5 px-6 bg-white border border-border rounded-xl mb-5 w-full" onClick={showCreatePost}>
        <div className="w-full flex items-center gap-4 mb-4">
          <Link to={"/users/username"}>
            <Avatar className="size-9 border">
              <AvatarImage src={auth?.profilePicture} className="object-cover" />
              <AvatarFallback className="bg-teal-100 text-primary">{auth?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 px-4 py-1.5 rounded-full bg-slate-200">
            <span className="text-sm font-normal text-zinc-500">
              What's on your mind?
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-5 text-primary">
            <Image className="size-5" />
            <Paperclip className="size-5" />
            <MapPin className="size-5" />
            <Smile className="size-5" />
          </div>
          <Button onClick={showCreatePost}>Post</Button>
        </div>
      </div>

      <CreatePostModal isOpen={isCreatePostModelOpen} onOpenChange={setIsCreatePostModelOpen} />
    </>
  );
};

export default NewPost;
