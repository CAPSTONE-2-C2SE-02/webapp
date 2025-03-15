import { ChevronDown, LogOut, Settings, SquarePen, UserRoundPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import avatarDemo from "@/assets/avatar-demo.jpg";
import { Link } from "react-router";
import { Button } from "../ui/button";

export default function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex items-center text-primary gap-2">
          <span className="font-semibold">Ngoc Duc</span>
          <Avatar className="size-10">
            <AvatarImage src={avatarDemo} alt="Avatar" />
            <AvatarFallback>Ngoc Duc</AvatarFallback>
          </Avatar>
          <ChevronDown className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Ngoc Duc</p>
            <p className="text-xs leading-none text-muted-foreground">
              @ngocduc.812
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <UserRoundPen />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/createtour">
              <SquarePen />
              New Tour
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <Settings />
              Setting
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button variant="default">
            <LogOut />
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
