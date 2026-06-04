import { useState, useEffect } from "react";
import { Menu, X, GitBranch, LogOut, User } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Magnetic } from "./Magnetic";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui-context";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { openInquiry } = useUI();

  const navItems = [
    { to: "/research", label: "Research" },
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/team", label: "Team" },
    { to: "/blog", label: "Blog" },
    { to: "/benchmarks", label: "Benchmarks" },
    { to: "/docs", label: "Docs" },
    { to: "/console", label: "Console" },
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "py-4" : "py-6"}`}
    >
      <div className="container-custom">
        <div
          className={`relative flex items-center justify-between px-6 py-3 rounded-2xl border transition-all duration-500 ${isScrolled ? "bg-bg/80 backdrop-blur-xl border-white/10 shadow-2xl" : "bg-transparent border-transparent"}`}
        >
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-display font-black text-white text-sm shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                M
              </div>
              <span className="font-display font-bold text-xl tracking-tighter text-white">
                MLAI CORP
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? "text-white" : "text-text-dim hover:text-white"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://github.com/mlai-corp"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-dim hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <GitBranch className="w-5 h-5" />
            </a>

            <div className="h-4 w-px bg-white/10 mx-2" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-text-dim max-w-[100px] truncate">
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
                  Sign In
                </Button>
              </Link>
            )}

            <Magnetic>
              <Button
                onClick={openInquiry}
                className="bg-white text-black hover:bg-blue-50 hover:scale-105 transition-all font-bold px-6"
              >
                Start Inquiry
              </Button>
            </Magnetic>
          </div>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 p-4 lg:hidden"
          >
            <div className="bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `text-lg font-medium py-3 transition-colors ${isActive ? "text-blue-400" : "text-white"}`
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
                      Sign In
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
                  Start Inquiry
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
