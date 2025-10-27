"use client";

import { Check, X, UserCheck } from "lucide-react";
import UserCard from "./UserCard";
import { User } from "@/types/user";

interface Props {
  users: User[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  searchQuery: string;
}

export default function FriendRequests({ users, onAccept, onReject, searchQuery }: Props) {
  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!filteredUsers.length) {
    return (
      <div className="text-center py-12">
        <UserCheck size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Bạn chưa nhận lời mời kết bạn nào.</p>
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
            <div className="flex gap-2">
              <button
                onClick={() => onAccept?.(u._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                <Check size={16} /> Chấp nhận
              </button>
              <button
                onClick={() => onReject?.(u._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition"
              >
                <X size={16} /> Từ chối
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}