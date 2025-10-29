"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@/types/user";

const navItems = [
  { label: "Bảng Feed", href: "/feed" },
  { label: "Bạn bè", href: "/friends" },
  { label: "Chat", href: "/chats" },
  { label: "Hồ sơ", href: "/profile" },
  { label: "Hẹn Hò", href: "/dating" },
];

export default function Navbar({ currentPath }: { currentPath: string }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-pink-500 text-white px-6 py-3 shadow-md flex items-center justify-between relative">
      {/* Logo */}
      <Link
        href="/feed"
        className="text-2xl font-bold tracking-wide hover:opacity-90 transition"
      >
        💖 Social Dating
      </Link>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded hover:bg-pink-400 transition"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Navigation items + User info */}
      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row items-center absolute md:static top-16 left-0 w-full md:w-auto bg-pink-500 md:bg-transparent z-50 md:gap-8 gap-3 px-6 md:px-0 pb-3 md:pb-0`}
      >
        {/* Nav links */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`font-medium px-3 py-2 rounded-lg transition ${
              currentPath === item.href
                ? "bg-pink-300 text-pink-900"
                : "hover:bg-pink-400"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        {/* User info + Logout (hiện cả mobile lẫn desktop) */}
        <div className="flex items-center gap-3 border-t md:border-0 border-pink-400 pt-3 md:pt-0 mt-2 md:mt-0 w-full md:w-auto justify-between md:justify-normal">
          <div className="flex items-center gap-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-pink-500 font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <span className="font-semibold">{user?.full_name || "Người dùng"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1 bg-pink-700 hover:bg-pink-800 rounded-md transition"
          >
            <LogOut size={16} /> <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
