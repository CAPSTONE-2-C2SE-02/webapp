import { Calendar, ChevronDown, FileClock, Loader2, LogOut, PlaneTakeoff, Settings, UserRoundPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutMutation } from "@/services/root-api";
import { logOut } from "@/stores/slices/auth-slice";

export default function UserNav() {
  const { userInfo, token } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (token) {
        await logout({ token });
      }
      dispatch(logOut());
      navigate(0);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-primary gap-2 outline-none border-none focus:outline-none">
          <Avatar className="size-10">
            <AvatarImage src={userInfo?.profilePicture} alt="Avatar" className="object-cover" />
            <AvatarFallback className="bg-teal-100 text-primary">{userInfo?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <ChevronDown className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{userInfo?.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={`/${userInfo?.username}`}>
              <UserRoundPen />
              Profile
            </Link>
          </DropdownMenuItem>
          {userInfo?.role === "TRAVELER" && (
            <DropdownMenuItem asChild>
              <Link to="/history-booking">
                <FileClock />
                Booking History
              </Link>
            </DropdownMenuItem>
          )}
          {userInfo?.role === "TOUR_GUIDE" && (
            <DropdownMenuItem asChild>
              <Link to="/tour-management">
                <PlaneTakeoff />
                Manage Tours
              </Link>
            </DropdownMenuItem>
          )}
          {userInfo?.role === "TOUR_GUIDE" && (
            <DropdownMenuItem asChild>
              <Link to="/busy-schedule">
                <Calendar />
                Manage Schedules
              </Link>
            </DropdownMenuItem>
           )}
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <Settings />
              Setting
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button variant="ghost" onClick={handleLogout}>
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut />}
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
