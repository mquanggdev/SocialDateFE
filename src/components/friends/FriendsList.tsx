"use client";

import { UserMinus, Users } from "lucide-react";
import UserCard from "./UserCard";
import { User } from "@/types/user";

interface Props {
  users: User[];
  onRemove?: (id: string) => void;
  searchQuery: string;
}

export default function FriendsList({ users, onRemove, searchQuery }: Props) {
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredUsers.length) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Bạn chưa có bạn bè nào.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {filteredUsers.map((u) => (
        <UserCard
          key={u._id}
          user={u}
          actions={
            <button
              onClick={() => onRemove?.(u._id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <UserMinus size={16} /> Xóa
            </button>
          }
        />
      ))}
    </div>
  );
}