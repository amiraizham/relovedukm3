import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  Heart,
  ClipboardList,
  Megaphone,
  Clock,
  LogOut,
  User,
  HelpCircle,
  Search,
  Settings,
  EditIcon,
} from "lucide-react";
import clsx from "clsx";

type User = {
  id: number;
  name: string;
  email: string;
  // Add other properties as needed
  role: string;
};

const Header = () => {
  const page = usePage();
  const url = page.url;
  const user = page.props.auth?.user as User | undefined;
  const csrfToken = page.props.csrf_token;
  const [search, setSearch] = React.useState("");

 const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('dashboard'), { search }, { preserveScroll: true, replace: true });
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm rounded-b-lg">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg">
        <span className="text-pink-600 text-2xl">★</span>
        <span>RelovedUKM</span>
      </div>

      {/* Navigation Tabs */}
      {user && (
        <nav className="flex items-center gap-3">
            {user.role === 'admin' ? (
            <span className="text-sm font-medium text-muted-foreground">
                Welcome, Admin
            </span>
            ) : (
            <>
                <Link href="/dashboard">
                <NavTab icon={<LayoutGrid size={16} />} label="Home" active={url.startsWith("/dashboard") || url.startsWith("/products")} />
                </Link>
                <Link href="/favourites">
                <NavTab icon={<Heart size={16} />} label="Favourites" active={url.startsWith("/favourites")} />
                </Link>
                <Link href={route('chat.index')}>
                <NavTab icon={<ClipboardList size={16} />} label="Chats" active={url.startsWith("/chat")} />
                </Link>
                <Link href={route('notifications.index')}>
                <NavTab icon={<Megaphone size={16} />} label="Notifications" active={url.startsWith("/notifications") || url.startsWith("/review")} />
                </Link>
                {/*<NavTab icon={<Clock size={16} />} label="Analytics" active={url.startsWith("/analytics")} />*/}
            </>
            )}
        </nav>
        )}


      {/* Right: Search + Profile/Buttons */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Search */}
            {user.role !== "admin" && (
              <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-8 w-56 rounded-full text-sm bg-muted"
              />
            </form>
            
            )}


            <HelpCircle className="w-5 h-5 text-muted-foreground cursor-pointer" />
            {/* <Link href={route("profile.update")} className="flex items-center">
              <Settings className="w-5 h-5 text-muted-foreground cursor-pointer" />
             </Link> */}
            

            {/* Avatar Dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={clsx(
        "rounded-full border transition-all",
        url.startsWith("/profile") && "ring-2 ring-pink-500"
      )}>
                <img
                    src="/assets/img/default-profile.jpg"
                    alt="avatar"
                    className="h-9 w-9 rounded-full border"
                />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md">
                <DropdownMenuItem asChild>
                  <Link href={route("profile.show", { id: user.id })} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={route("profile.update")} className="flex items-center">
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ✅ Wrap form inside asChild properly */}
                <DropdownMenuItem onSelect={() => router.post(route("logout"))}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Link href={route("login")}>
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href={route("register")}>
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

const NavTab = ({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) => {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm ${
        active
          ? "bg-gradient-to-r from-pink-600 to-pink-800 text-white"
          : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </Button>
  );
};

export default Header;
