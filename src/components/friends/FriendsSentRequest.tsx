"use client";

import { Undo2, Send } from "lucide-react";
import UserCard from "./UserCard";
import { User } from "@/types/user";

interface Props {
  users: User[];
  onCancel?: (id: string) => void;
  searchQuery: string;
}

export default function FriendsSentRequest({ users, onCancel, searchQuery }: Props) {
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredUsers.length) {
    return (
      <div className="text-center py-12">
        <Send size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Bạn chưa gửi yêu cầu kết bạn nào.</p>
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
              onClick={() => onCancel?.(u._id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
            >
              <Undo2 size={16} /> Thu hồi
            </button>
          }
        />
      ))}
    </div>
  );
}