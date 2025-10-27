
import React from "react";
import { User } from "@/types/user";

interface UserCardProps {
  user: User;
  actions?: React.ReactNode; // Nút hành động (Add friend, Remove, Chat, v.v.)
}

export default function UserCard({ user, actions }: UserCardProps) {
  return (
    <div
      key={user._id}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition bg-white"
    >
      {/* Thông tin người dùng */}
      <div className="flex items-center gap-4">
        <img
          src={user.avatar_url || "default-avatar.jpg"}
          alt={user.full_name}
          className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
        />
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm sm:text-base">
            {user.full_name}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Các nút hành động (tùy vào nơi sử dụng) */}
      <div className="flex gap-2 w-full sm:w-auto">{actions}</div>
    </div>
  );
}
