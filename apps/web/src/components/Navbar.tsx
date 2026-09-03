import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Magnetic } from "./Magnetic";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui-context";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { openInquiry } = useUI();

  const navItems = [
    { to: "/#control-plane", label: "Product" },
    { to: "/#request-path", label: "How it works" },
    { to: "/docs", label: "Docs" },
    { to: "/research", label: "Research" },
    { to: "/about", label: "Company" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeIfDesktop = () => {
      if (mq.matches) {
        setIsMobileMenuOpen(false);
      }
    };
    closeIfDesktop();
    mq.addEventListener("change", closeIfDesktop);
    return () => mq.removeEventListener("change", closeIfDesktop);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-4" : "py-6"}`}
    >
      <div className="container-custom">
        <div
          className={`relative flex items-center justify-between px-6 py-3 rounded-2xl border transition-all duration-300 ${isScrolled ? "bg-bg/80 backdrop-blur-xl border-white/10 shadow-lg" : "bg-transparent border-transparent"}`}
        >
          <div className="flex items-center gap-12">
            <Logo size="md" />

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative text-sm font-medium transition-colors ${isActive ? "text-white after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-cyan-400/60" : "text-text-dim hover:text-white"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-medium text-text-dim max-w-25 truncate">
                      {user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-surface/95 backdrop-blur-xl border-white/10"
                >
                  <DropdownMenuLabel className="text-xs text-text-dim uppercase tracking-widest">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-400 focus:text-red-400"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-dim hover:text-white"
                >
                  Invited? Sign in
                </Button>
              </Link>
            )}

            <Magnetic>
              <Button
                asChild
                className="bg-white text-black hover:bg-cyan-50 transition-colors font-bold px-6"
              >
                <Link to={user ? "/console" : "/login"}>{user ? "Open Console" : "Enter Quesar"}</Link>
              </Button>
            </Magnetic>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              className="lg:hidden p-2 text-white"
              aria-label="Toggle navigation menu"
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </SheetTrigger>
            <SheetContent
              id="mobile-navigation"
              side="right"
              className="bg-surface border-white/10 w-full sm:max-w-sm gap-0 p-0"
            >
              <SheetHeader className="border-b border-white/10 px-6 py-4">
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `text-lg font-medium py-3 transition-colors ${isActive ? "text-cyan-400" : "text-white"}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  {user ? (
                    <>
                      <div className="text-sm text-text-dim py-2">
                        {user.email}
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full h-12">
                          Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full h-12"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12">
                        Invited? Sign in
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={() => {
                      openInquiry();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-white text-black font-bold h-12"
                  >
                    Request Access
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
