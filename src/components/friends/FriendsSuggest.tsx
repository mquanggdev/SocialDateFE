"use client";

import { UserPlus, Users } from "lucide-react";
import UserCard from "./UserCard";
import { User } from "@/types/user";

interface Props {
  users: User[];
  onAdd?: (id: string) => void;
  searchQuery: string;
}

export default function FriendsSuggest({ users, onAdd, searchQuery }: Props) {
  if (!users) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Không có đề cử nào.</p>
      </div>
    );
  }
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredUsers.length) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Không có đề cử nào.</p>
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
              onClick={() => onAdd?.(u._id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <UserPlus size={16} /> Thêm
            </button>
          }
        />
      ))}
    </div>
  );
}
