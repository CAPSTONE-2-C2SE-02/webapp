import { Calendar, ChevronDown, History, Loader2, LogOut, PlaneTakeoff, UserRoundPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useLogoutMutation } from "@/services/root-api";
import { logOut } from "@/stores/slices/auth-slice";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import SearchInput from "./search-input";

export default function UserNav() {
  const { userInfo, token } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex items-center text-primary gap-2 outline-none border-none focus:outline-none">
            <Avatar className="size-10">
              <AvatarImage src={userInfo?.profilePicture} alt="Avatar" className="object-cover" />
              <AvatarFallback className="bg-teal-100 text-primary">{userInfo?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <ChevronDown className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="w-1/2">
          <div className="w-full">
            <SearchInput />
          </div>
        </SheetContent>
      </Sheet>
    )
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
      <DropdownMenuContent className="w-96 md:w-48 translate-y-5 px-3 py-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-primary font-medium leading-none">{userInfo?.fullName}</p>
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
              <Link to="/booking-history">
                <History />
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut />}
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
