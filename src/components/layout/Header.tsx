"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { clearCart } from "@/store/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Menu,
  User,
  LogOut,
  Package,
  MessageSquare,
  UserCircle,
} from "lucide-react";

import NotificationBell from "@/components/layout/NotificationBell";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // proceed with client-side logout regardless
    }
    dispatch(logout());
    dispatch(clearCart());
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    ...(isAuthenticated
      ? [
          { href: "/wishlist", label: "Wishlist" },
          { href: "/orders", label: "Orders" },
          { href: "/messages", label: "Messages" },
        ]
      : []),
  ];

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">ShopNest</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            onClick={() => router.push("/products")}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          {isAuthenticated && <NotificationBell />}

          {/* Cart */}
          <CartDrawer />

          {/* User Menu - Desktop */}
          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-0">
                  {/* User header */}
                  <div className="flex items-center gap-3 border-b px-4 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <DropdownMenuItem className="gap-2 rounded-md px-3 py-2" render={<Link href="/profile" />}>
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-md px-3 py-2" render={<Link href="/orders" />}>
                        <Package className="h-4 w-4 text-muted-foreground" />
                        Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-md px-3 py-2" render={<Link href="/messages" />}>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Messages
                    </DropdownMenuItem>
                  </div>

                  {/* Logout */}
                  <div className="border-t p-1.5">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="gap-2 rounded-md px-3 py-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  ShopNest
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-1">
                {/* User Info (mobile) */}
                {isAuthenticated && user && (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}

                {/* Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Link>

                <Separator className="my-2" />

                {/* Auth Actions (mobile) */}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <UserCircle className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-3 pt-2">
                    <Button asChild>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
