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
    <header className="border-b sticky top-0 right-0 left-0 bg-white z-50">
      <div className="container mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-5 flex-1">
          <Link to="/" className="size-10">
            <img src={tripConnectLogo} className="w-full h-full object-cover" />
          </Link>
          <SearchInput />
        </div>
        <nav className="flex items-center justify-center gap-4 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.placeholder}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 py-2 rounded-full transition-all duration-300 ease-in-out",
                  isActive ? "text-primary bg-teal-500/40 px-4" : "text-slate-300 px-2"
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
        <div className="flex items-center gap-5 flex-1 justify-end">
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
