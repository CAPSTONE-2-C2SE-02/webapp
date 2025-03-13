import { Link, NavLink } from "react-router";
import tripConnectLogo from "@/assets/tripconnect.svg";
import SearchInput from "./search-input";
import { Home, Plane, HandHeart, MessageCircle, Bell, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import UserNav from "./user-nav";

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
    href: "/campaigns",
    icon: HandHeart,
    placeholder: "Campaigns"
  },
  {
    href: "/messages",
    icon: MessageCircle,
    placeholder: "Messages"
  }
]

const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-5">
          <Link to="/">
            <img src={tripConnectLogo} className="size-10" />
          </Link>
          <SearchInput />
        </div>
        <nav className="flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.placeholder}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full",
                  isActive ? "text-primary bg-teal-500/40" : "text-slate-300"
                )
              }
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
        <div className="flex items-center gap-5">
          <Button variant="secondary" className="rounded-xl size-10">
            <Bell className="size-5" />
          </Button>
          <Button variant="secondary" className="rounded-xl size-10">
            <Bookmark className="size-5" />
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
