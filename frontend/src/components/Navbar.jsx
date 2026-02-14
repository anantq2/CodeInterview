import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-navbar sticky top-0 z-50 shadow-lg" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300"
        >
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
              CodeInterview
            </span>
            <span className="text-[10px] text-base-content/50 font-medium -mt-0.5 tracking-wider uppercase">
              Code Together
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {/* NAV LINKS */}
          {[
            { path: "/problems", icon: BookOpenIcon, label: "Problems" },
            { path: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
          ].map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`relative px-4 py-2 rounded-xl transition-all duration-300 
                ${isActive(path)
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-base-content/5 text-base-content/55 hover:text-base-content"
                }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="font-semibold text-sm hidden sm:inline">{label}</span>
              </div>
              {/* Active indicator */}
              {isActive(path) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          <div className="ml-4">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
