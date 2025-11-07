"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, UserCheck, Send } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequests from "@/components/friends/FriendsRequest";
import FriendsSuggest from "@/components/friends/FriendsSuggest";
import FriendsSentRequest from "@/components/friends/FriendsSentRequest";
import {
  getListRecomendation,
  getFriendsList,
  getFriendRequests,
  getSentRequests,
  User,
} from "@/lib/api/friends/friends";

type TabKey = "suggested" | "friends" | "requests" | "sent";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("suggested");
  const [search, setSearch] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { user, isLoading } = useAuth();

  const { socket } = useSocket();

  const fetchData = useCallback(async () => {
    if (!user) {
      setError("Vui lòng đăng nhập để xem danh sách bạn bè");
      return;
    }
    try {
      setLoading(true);
      const [suggested, friends, requests, sents] = await Promise.all([
        getListRecomendation(),
        getFriendsList(),
        getFriendRequests(),
        getSentRequests(),
      ]);

      if (
        !Array.isArray(suggested) ||
        !Array.isArray(friends) ||
        !Array.isArray(requests) ||
        !Array.isArray(sents)
      ) {
        throw new Error("Dữ liệu từ server không hợp lệ");
      }

      setSuggestedUsers(suggested);
      setFriends(friends);
      setFriendRequests(requests);
      setSentRequests(sents);
    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !isLoading) fetchData();
  }, [fetchData, user, isLoading]);

  // Socket handlers (dùng functional updates để tránh stale state)
  useEffect(() => {
    if (!socket || !user) return;

    const onAddRequest = ({ infoUser, friendId }: any) => {
      // Nếu mình là người được request
      if (friendId === user._id) {
        setSuggestedUsers((prev) => prev.filter((r) => r._id !== infoUser._id));
        setFriendRequests((prev) => [...prev, infoUser]);
      }
    };

    const onAcceptRequest = ({ infoUser, friendId, roomChatId }: any) => {
      const otherId = infoUser?._id;
      if (!otherId) return;

      // Luôn thêm bạn mới vào danh sách bạn bè
      setFriends((prev) => {
        if (prev.some((f) => f._id === otherId)) return prev;
        return [...prev, { ...infoUser, roomChat: roomChatId }];
      });

      // Nếu friendId KHÔNG trùng với user._id → mình là người chấp nhận
      if (friendId !== user._id) {
        setSuggestedUsers((prev) => prev.filter((req) => req._id !== friendId));
      } else {
        // Ngược lại → mình là người được chấp nhận
        setSentRequests((prev) => prev.filter((req) => req._id !== otherId));
      }
    };

    const onRefuseRequest = ({ myId, friendId, infoUser }: any) => {
      if (friendId === user._id) {
        setSentRequests((prev) => prev.filter((req) => req._id !== myId));
        setSuggestedUsers((prev) => [...prev, infoUser]);
      }
    };

    const onCancelRequest = ({ myId, friendId, targetInfo }: any) => {
      if (friendId === user._id) {
        setFriendRequests((prev) => prev.filter((req) => req._id !== myId));
      } else {
        setSuggestedUsers((prev) => [...prev, targetInfo]);
      }
    };

    const onRemoveFriend = ({ myId, friendId, myInfo, targetInfo }: any) => {
      // mình là thhằng xóa
      if (myId === user._id) {
        setSuggestedUsers((prev) => [...prev, targetInfo]);
      } else {
        setFriends((prev) => prev.filter((f) => f._id !== myId));
        setSuggestedUsers((prev) => [...prev, myInfo]);
      }
    };

    const onUserOnline = ({ status, userId: targetId }: any) => {
      const mapper = (u: User) => (u._id === targetId ? { ...u, status } : u);
      setFriends((prev) => prev.map(mapper));
      setFriendRequests((prev) => prev.map(mapper));
      setSentRequests((prev) => prev.map(mapper));
      setSuggestedUsers((prev) => prev.map(mapper));
    };

    const onError = ({ message }: any) => setError(message);

    socket.on("SERVER_RETURN_REQUEST_ADD_FRIEND", onAddRequest);
    socket.on("SERVER_RETURN_REQUEST_ACCEPT_FRIEND", onAcceptRequest);
    socket.on("SERVER_RETURN_ID_REQUEST_REFUSE_FRIEND", onRefuseRequest);
    socket.on("SERVER_RETURN_ID_REQUEST_CANCEL_FRIEND", onCancelRequest);
    socket.on("SERVER_RETURN_REQUEST_REMOVE_FRIEND", onRemoveFriend);
    socket.on("SERVER_RETURN_USER_ONLINE", onUserOnline);
    socket.on("error", onError);

    return () => {
      socket.off("SERVER_RETURN_REQUEST_ADD_FRIEND", onAddRequest);
      socket.off("SERVER_RETURN_REQUEST_ACCEPT_FRIEND", onAcceptRequest);
      socket.off("SERVER_RETURN_ID_REQUEST_REFUSE_FRIEND", onRefuseRequest);
      socket.off("SERVER_RETURN_ID_REQUEST_CANCEL_FRIEND", onCancelRequest);
      socket.off("SERVER_RETURN_REQUEST_REMOVE_FRIEND", onRemoveFriend);
      socket.off("SERVER_RETURN_USER_ONLINE", onUserOnline);
      socket.off("error", onError);
    };
  }, [socket, user]);

  // Handlers - dùng functional updates để tránh stale closures
  const handleAddFriend = async (userId: string) => {
    if (!user || !socket) return;
    try {
      setSentRequests((prev) => [
        ...prev,
        suggestedUsers.find((u) => u._id === userId)!,
      ]);
      setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));

      socket.emit("CLIENT_SEND_REQUEST_ADD_FRIEND", {
        myId: user._id,
        friendId: userId,
      });
    } catch (err: any) {
      console.error("Lỗi khi thêm bạn:", err);
      setError(err?.message ?? "Không thể thêm bạn bè");
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    if (!user || !socket) return;
    try {
      setFriends((prev) => prev.filter((req) => req._id !== userId));
      socket.emit("CLIENT_REMOVE_FRIEND", { myId: user._id, friendId: userId });
    } catch (err: any) {
      console.error("Lỗi khi xóa bạn:", err);
      setError(err?.message ?? "Không thể xóa bạn bè");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!user || !socket) return;
    try {
      setFriendRequests((prev) => prev.filter((req) => req._id !== userId));
      socket.emit("CLIENT_ACCEPT_FRIEND_REQUEST", {
        acceptorID: user._id,
        requesterId: userId,
      });
    } catch (err: any) {
      console.error("Lỗi khi chấp nhận lời mời:", err);
      setError(err?.message ?? "Không thể chấp nhận lời mời");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!user || !socket) return;
    try {
      setFriendRequests((prev) => prev.filter((req) => req._id !== userId));
      socket.emit("CLIENT_REJECT_FRIEND_REQUEST", {
        myId: user._id,
        friendId: userId,
      });
    } catch (err: any) {
      console.error("Lỗi khi từ chối lời mời:", err);
      setError(err?.message ?? "Không thể từ chối lời mời");
    }
  };

  const handleCancelRequest = async (userId: string) => {
    if (!user || !socket) return;
    try {
      setSentRequests((prev) => prev.filter((req) => req._id !== userId));
      socket.emit("CLIENT_CANCEL_FRIEND_REQUEST", {
        myId: user._id,
        friendId: userId,
      });
    } catch (err: any) {
      console.error("Lỗi khi thu hồi yêu cầu:", err);
      setError(err?.message ?? "Không thể thu hồi yêu cầu");
    }
  };

  const tabs = [
    { key: "suggested" as TabKey, label: "Đề cử", icon: UserPlus },
    { key: "friends" as TabKey, label: "Bạn bè", icon: Users },
    {
      key: "requests" as TabKey,
      label: `Lời mời (${friendRequests.length})`,
      icon: UserCheck,
    },
    { key: "sent" as TabKey, label: "Đã gửi", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 sm:px-5 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-pink-500 text-white shadow-md hover:bg-pink-600"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading and Error */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-500 mt-3">Đang tải...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-4 mt-8">
            {activeTab === "suggested" && (
              <FriendsSuggest
                users={suggestedUsers}
                onAdd={handleAddFriend}
                searchQuery={search}
              />
            )}
            {activeTab === "friends" && (
              <FriendsList
                users={friends}
                onRemove={handleRemoveFriend}
                searchQuery={search}
              />
            )}
            {activeTab === "requests" && (
              <FriendRequests
                users={friendRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                searchQuery={search}
              />
            )}
            {activeTab === "sent" && (
              <FriendsSentRequest
                users={sentRequests}
                onCancel={handleCancelRequest}
                searchQuery={search}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
