// UPDATED Header.tsx
import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { IconButton } from "../button/IconButton";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
  LogOut,
  User,
  HelpCircle,
  Search,
  EditIcon,
} from "lucide-react";
import clsx from "clsx";


function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

type HeaderProps = {
  unreadChats?: boolean;
};

const Header = ({ unreadChats }: HeaderProps) => {
  const page = usePage();
  const url = page.url;
  const user = page.props.auth?.user as User | undefined;
  const [search, setSearch] = React.useState("");
  const hasUnreadChats = page.props.unreadChats as boolean;
  const hasNewRequests = page.props.hasNewRequests as boolean;
  const hasBookingUpdates = page.props.hasBookingUpdates as boolean;
  const hasRejectedProducts = page.props.hasRejectedProducts as boolean;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route("dashboard"), { search }, { preserveScroll: true, replace: true });
  };

  const NavTab = ({
    icon,
    label,
    active = false,
  }: {
    icon: React.ReactNode;
    label: React.ReactNode;
    active?: boolean;
  }) => (
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

  return (
    <header>
      {/* ✅ MOBILE HEADER */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 bg-white shadow-sm border-b">
          {/* Center: Logo */}
  <Link href={user ? "/dashboard" : "/"}>
    <img src="/relovedlogoukm.svg" alt="Logo" className="h-6 w-auto" />
  </Link>

  {/* Right: Search */}
  {user && user.role !== "admin" && (
      <form onSubmit={handleSearch} className="pl-3 flex-1">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 w-full rounded-full text-sm focus:ring-2 focus:ring-pink-300"
        />
      </div>
    </form>
  )}
  {/* Left: Hamburger + Profile */}
  <div className="flex items-center gap-2">
    {/* Hamburger Menu */}
    <Sheet>

    <SheetTrigger asChild>
  <IconButton>
    <Menu className="w-5 h-5" />
  </IconButton>
</SheetTrigger>


  <SheetContent side="left" className="w-64 bg-white">
  <span className="sr-only">
    <h2>Navigation Menu</h2>
  </span>
    <div className="space-y-4 mt-6">
          {user ? (
            user.role === "admin" ? (
              <span className="text-sm font-semibold ml-2">Welcome, Admin</span>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">Home</Button>
                </Link>
                <Link href="/favourites">
                  <Button variant="ghost" className="w-full justify-start">Favourites</Button>
                </Link>
                <Link href={route("chat.index")}>
                  <Button variant="ghost" className="w-full justify-start relative">
                    Chats
                    {hasUnreadChats && !url.startsWith("/chat") && (
                      <>
                        <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500" />
                      </>
                    )}
                  </Button>
                </Link>
                <Link href={route("notifications.index")}>
                  <Button variant="ghost" className="w-full justify-start relative">
                    Notifications
                    {(hasNewRequests || hasBookingUpdates || hasRejectedProducts) && (
                      <>
                        <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                        <span className="absolute top-2 right-4 h-2 w-2 rounded-full bg-red-500" />
                      </>
                    )}
                  </Button>
                </Link>
               
              </>
            )
          ) : (
            <>
              <Link href={route("login")}>
                <Button variant="ghost" className="w-full justify-start">Log In</Button>
              </Link>
              <Link href={route("register")}>
                <Button variant="ghost" className="w-full justify-start">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>

    {/* Profile Dropdown */}
    {user && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-9 w-9 flex items-center justify-center rounded-full border text-sm font-semibold bg-pink-100 text-pink-600">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-white shadow-lg rounded-md ml-1 mt-1">
          <DropdownMenuItem asChild>
          {user?.id && (
            <Link href={route("profile.show", { id: user.id })}>
              <User className="mr-2 h-4 w-4" />
              {user.name}
              </Link>)}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={route("profile.update")}>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.post(route("logout"))}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )}
  </div>


</div>


      {/* ✅ DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between px-6 py-3 mt-3 mx-2 bg-white shadow-sm shadow-gray-300 border border-slate-200 rounded-full">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"}>
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="/relovedlogoukm.svg" alt="RelovedUKM Logo" className="h-8 w-auto" />
          </div>
        </Link>

        {/* Nav */}
        {user && (
          <nav className="flex items-center gap-3">
            {user.role === "admin" ? (
              <span className="text-sm font-medium text-muted-foreground">Welcome, Admin</span>
            ) : (
              <>
                <Link href="/dashboard"><NavTab icon={<LayoutGrid size={16} />} label="Home" active={url.startsWith("/dashboard")} /></Link>
                <Link href="/favourites"><NavTab icon={<Heart size={16} />} label="Favourites" active={url.startsWith("/favourites")} /></Link>
                <Link href={route("chat.index")}>
                  <NavTab icon={<ClipboardList size={16} />} label={
                    <span className="relative inline-flex items-center">
                      Chats
                      {hasUnreadChats && !url.startsWith("/chat") && (
                        <>
                          <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
                        </>
                      )}
                    </span>
                  } active={url.startsWith("/chat")} />
                </Link>
                <Link href={route("notifications.index")}>
                  <NavTab icon={<Megaphone size={16} />} label={
                    <span className="relative inline-flex items-center">
                      Notifications
                      {(hasNewRequests || hasBookingUpdates || hasRejectedProducts) && (
                        <>
                          <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500" />
                        </>
                      )}
                    </span>
                  } active={url.startsWith("/notifications")} />
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Search + Profile/Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role !== "admin" && (
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="pl-8 w-56 rounded-full text-sm focus:ring-2 focus:ring-pink-300"
                  />
                </form>
              )}
              <HelpCircle className="w-5 h-5 text-muted-foreground cursor-pointer" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={clsx(
                    "h-9 w-9 flex items-center justify-center rounded-full border text-sm font-semibold bg-pink-100 text-pink-600 transition-all",
                    url.startsWith("/profile") && "ring-2 ring-pink-500"
                  )}>
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md">
                  <DropdownMenuItem asChild>        
                    {user?.id && (
                  <Link href={route("profile.show", { id: user.id })}>
                    <User className="mr-2 h-4 w-4" />
                    {user.name}
                    </Link>)}
              </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href={route("profile.update")}><EditIcon className="mr-2 h-4 w-4" />Edit Profile</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.post(route("logout"))}><LogOut className="mr-2 h-4 w-4" />Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href={route("login")}><Button className="bg-pink-600 hover:bg-pink-700 text-white">Log In</Button></Link>
              <Link href={route("register")}><Button variant="outline">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
