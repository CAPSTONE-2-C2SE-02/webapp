import { Link, NavLink } from "react-router";
import tripConnectLogo from "@/assets/tripconnect.svg";
import SearchInput from "./search-input";
import { Home, Plane, MessageCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import UserNav from "./user-nav";
import { useAppSelector } from "@/hooks/redux";
import NotificationSheet from "../notification/notification-sheet";

const NAV_ITEMS = [
  {
    href: "/",
    icon: Home,
    placeholder: "Home"
  },
  {
    href: "/tours",
    icon: Plane,
    placeholder: "Tours"
  },
  {
    href: "/messages",
    icon: MessageCircle,
    placeholder: "Messages"
  }
]

const Header = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  return (
    <header className="border-b sticky top-0 right-0 left-0 bg-white/90 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center justify-between px-3 md:px-4 lg:px-8 py-4">
        <div className="flex items-center gap-2 md:gap-3 lg:gap-5 flex-1">
          <Link to="/" className="size-10 flex items-center gap-2 md:inline-block">
            <img src={tripConnectLogo} className="w-full h-full object-cover" />
            <span className="inline-block md:hidden font-madimi text-lg font-bold tracking-wide text-teal-500">TripConnect</span>
          </Link>
          <SearchInput />
        </div>
        <nav className="hidden md:flex items-center justify-center gap-2 lg:gap-4 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.placeholder}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 py-2 rounded-full transition-all duration-300 ease-in-out",
                  isActive ? "text-primary bg-teal-200 px-4 border border-primary/10" : "text-slate-500 px-2"
                )
              }
              prefetch="intent"
            >
              {({ isActive }) => (
                <>
                  <item.icon className="size-5" />
                  <span className={isActive ? "text-sm font-medium" : "hidden"}>
                    {item.placeholder}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* header personal action */}
        <div className="flex items-center gap-4 md:gap-5 flex-1 justify-end">
          {isAuthenticated ? (
            <>
              <NotificationSheet />
              <Link to="/bookmarks">
                <Button variant="outline" className="rounded-xl size-10">
                  <Bookmark className="size-5" />
                </Button>
              </Link>
              <UserNav />
            </>
          ) : (
            <div className="space-x-2">
              <Link to="/login">
                <Button variant="default" className="rounded-xl">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="rounded-xl">
                  New Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
