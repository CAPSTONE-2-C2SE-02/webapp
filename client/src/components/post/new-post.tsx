import { Link } from "react-router";
import { Button } from "../ui/button";
import { Camera, Image, Paperclip, MapPin, Smile } from "lucide-react";
import { useState } from "react";
import CreateNewPostModal from "../modals/create-post-modal";
import useAuthInfo from "@/hooks/useAuth";

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
            <div className="size-9 rounded-full border border-slate-100 overflow-hidden">
              <img
                src={auth?.profilePicture}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="flex-1 px-4 py-1.5 rounded-full bg-slate-200">
            <span className="text-sm font-normal text-zinc-500">
              What's on your mind?
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-5 text-primary">
            <Camera className="size-5" />
            <Image className="size-5" />
            <Paperclip className="size-5" />
            <MapPin className="size-5" />
            <Smile className="size-5" />
          </div>
          <Button onClick={showCreatePost}>Post</Button>
        </div>
      </div>

      <CreateNewPostModal isOpen={isCreatePostModelOpen} onOpenChange={setIsCreatePostModelOpen} />
    </>
  );
};

export default NewPost;
