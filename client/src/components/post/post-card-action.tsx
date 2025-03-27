import { EllipsisVertical, Flag, Share2, Trash } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useAppSelector } from "@/hooks/redux";

interface PostCardActionProps {
  id: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
  }
}

const PostCardAction = ({ id, author }: PostCardActionProps) => {
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.auth);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant={"ghost"} size={"icon"}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="justify-between font-medium">
          Share
          <Share2 className="size-4 text-muted-foreground" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-between font-medium">
          Report
          <Flag className="size-4 text-muted-foreground font-medium" />
        </DropdownMenuItem>
        {isAuthenticated && userInfo?.username === author.username && (
          <DropdownMenuItem 
            className="justify-between font-medium"
            onClick={() => console.log(id)}
          >
            Delete
            <Trash className="size-4 text-red-500" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PostCardAction