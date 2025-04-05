import { CornerDownRight, MessageSquareMore, SendHorizonal } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Input } from "../ui/input"
import { Link } from "react-router"
import { useState } from "react"

const CommentPostModal = () => {
  const [isReplying, setIsReplying] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className="text-primary py-3 px-3.5 gap-4"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquareMore className="size-5" />
            <span className="text-sm font-medium leading-none">
              Comment
            </span>
          </div>
          <div className="flex items-center justify-center py-1 px-1.5 rounded-xl bg-primary/20">
            <span className="text-sm font-semibold leading-none">13</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl p-5 max-h-[calc(100vh-48px)] h-auto overflow-hidden gap-4 pb-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-primary">Comments</DialogTitle>
          <DialogDescription className="sr-only">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
          <div className="relative flex items-center justify-start gap-3">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src="" alt="" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <Input className="rounded-full h-10 pl-4" type="text" placeholder="Add comment..." />
            <Button className="absolute right-2 rounded-full top-1/2 -translate-y-1/2" size={"sm"} variant={"ghost"}>
              <SendHorizonal />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {/* comment item */}
          <div className="flex items-start gap-4 bg-slate-100 py-3 px-4 rounded-xl">
            <Avatar className="w-10 h-10 border">
              <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Link to={`/n2duc`} className="font-semibold text-primary">Ngoc Duc</Link>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <p className="mb-1">I'm really excited about this component. It's going to save me so much time!</p>
              {/* comment action */}
              <div className="flex items-center gap-3">
                <Button variant={"outline"} size={"sm"} className="h-7 px-2" onClick={() => setIsReplying(true)}>
                  <CornerDownRight /> Reply
                </Button>
              </div>
            </div>
          </div>
          {/* reply comment */}
          <div className="ml-10 pl-5 border-l-2 rounded-l-sm border-gray-200">
            <div className="flex items-start gap-4 bg-slate-100 py-3 px-4 rounded-xl">
              <Avatar className="w-10 h-10 border">
                <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Link to={`/n2duc`} className="font-semibold text-primary">Ngoc Duc</Link>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <p className="mb-1">I'm really excited about this component. It's going to save me so much time!</p>
                {/* comment action */}
                <div className="flex items-center gap-3">
                  <Button variant={"outline"} size={"sm"} className="h-7 px-2" onClick={() => setIsReplying(true)}>
                    <CornerDownRight /> Reply
                  </Button>
                </div>
              </div>
            </div>
            {isReplying && (
              <div className="relative flex items-center justify-start gap-3 mt-3">
                <Avatar className="border w-10 h-10">
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
                <Input className="rounded-full h-10 pl-4" type="text" placeholder="Add comment..." />
                <Button className="absolute right-2 rounded-full top-1/2 -translate-y-1/2" size={"sm"} variant={"ghost"}>
                  <SendHorizonal />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentPostModal