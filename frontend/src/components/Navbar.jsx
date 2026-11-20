import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFilm,
  FaRoute,
  FaTicketAlt,
  FaBuilding,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaHome,
} from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/", icon: FaHome },
    { name: "MCU Movies", path: "/movies", icon: FaFilm },
    { name: "Rewatch Plan", path: "/rewatch", icon: FaRoute },
    { name: "Cinemas", path: "/cinemas", icon: FaBuilding },
    { name: "Group Booking", path: "/booking", icon: FaTicketAlt },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0C10]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-lg shadow-red-900/40 border border-red-500/30 group-hover:scale-105 transition">
              <FaShieldAlt className="text-lg" />
              <div className="absolute -inset-0.5 rounded-lg bg-red-600/30 blur-sm -z-10 group-hover:bg-red-600/50 transition"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white uppercase">
                  Doomsday <span className="text-red-500">Ready</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60 hidden sm:inline-block">
                  MCU Phase 6
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono hidden sm:block">
                Rewatch Planner & Premiere Booking
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-red-600 text-white shadow-md shadow-red-900/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`text-sm ${active ? "text-white" : "text-gray-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend Connected</span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0F111A] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-red-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`text-base ${active ? "text-white" : "text-gray-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
