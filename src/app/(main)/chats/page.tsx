// app/(main)/chat/room/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  EllipsisVertical,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  X,
  Trash2Icon,
} from "lucide-react";
import { Message } from "@/types/message";
import {
  getMessageWithRoomId,
  getRoomList,
  Rooms,
} from "@/lib/api/chats/rooms";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import { showConfirm } from "@/components/ui/Swal";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

export default function RoomPage() {
  const [rooms, setRooms] = useState<Rooms[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Rooms | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isTypingSent, setIsTypingSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { socket } = useSocket();

  // Debounce typing
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Cuộn xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy danh sách phòng
  const fetchRooms = useCallback(async () => {
    if (!user || !user._id) {
      setError("Vui lòng đăng nhập để xem danh sách phòng");
      return;
    }
    try {
      setLoading(true);
      const data = await getRoomList();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || "Lỗi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Lấy tin nhắn + ĐÁNH DẤU ĐÃ ĐỌC NGAY KHI MỞ PHÒNG
  const fetchMessages = useCallback(
    async (room_id: string) => {
      try {
        setLoading(true);
        const listMessage = await getMessageWithRoomId(room_id);
        setMessages(listMessage);
      } catch (err: any) {
        setError(err.message || "Lỗi tải tin nhắn");
      } finally {
        setLoading(false);
      }
    },
    [socket, user]
  );

  // Chọn phòng
  const handleSelectRoom = (room: Rooms) => {
    setSelectedRoom(room);
    // ĐÁNH DẤU ĐÃ ĐỌC NGAY LẬP TỨC
    if (socket && user?._id) {
      socket.emit("CLIENT_MARK_MESSAGES_READ", {
        room_id: room.room_id,
        user_id: user._id,
      });
    }
    setIsTyping(false);
    setIsTypingSent(false);
    setShowEmoji(false);
    if (room.room_id) {
      fetchMessages(room.room_id);
    } else {
      setError("Không tìm thấy phòng chat");
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!user || !user._id || !socket || !selectedRoom || !newMessage.trim())
      return;

    try {
      const message = {
        room_id: selectedRoom.room_id,
        sender_id: user._id,
        receiver_id: selectedRoom.friend._id,
        content: newMessage.trim(),
        type: "text" as const,
      };

      const fakeMsg: Message = {
        ...message,
        _id: Date.now().toString(),
        is_read: false,
        is_recalled: false,
        timestamp: new Date().toISOString(),
      };

      socket.emit("CLIENT_SEND_MESSAGE", message);
      setNewMessage("");
      setShowEmoji(false);

      setRooms((prev) =>
        prev.map((r) =>
          r.room_id === selectedRoom.room_id
            ? { ...r, last_message: fakeMsg }
            : r
        )
      );
    } catch (err: any) {
      setError(err.message || "Lỗi gửi tin nhắn");
    }
  };

  // Thu hồi tin nhắn
  const handleRecallMessage = async (messageId: string) => {
    if (!socket || !selectedRoom) return;
    const confirmed = await showConfirm({
      icon: "warning",
      title: "Thu hồi tin nhắn?",
      text: "Hành động này không thể hoàn tác.",
      confirmText: "Thu hồi",
      cancelText: "Hủy",
    });
    if (confirmed) {
      socket.emit("CLIENT_RECALL_MESSAGE", {
        room_id: selectedRoom.room_id,
        message_id: messageId,
        user_id: user?._id,
      });
    }
  };

  // Typing
  const handleTyping = () => {
    if (!socket || !selectedRoom || !user?._id || isTypingSent) return;
    socket.emit("CLIENT_TYPING", {
      room_id: selectedRoom.room_id,
      user_id: user._id,
    });
    setIsTypingSent(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("CLIENT_STOP_TYPING", {
        room_id: selectedRoom.room_id,
        user_id: user._id,
      });
      setIsTypingSent(false);
    }, 3000);
  };
  const debouncedHandleTyping = debounce(handleTyping, 200);

  // Thêm emoji
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  // Đóng emoji khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  // Load rooms
  useEffect(() => {
    if (user && !authLoading) {
      fetchRooms();
    }
  }, [fetchRooms, user, authLoading]);

  // Socket events
  useEffect(() => {
    if (!socket || !user || !user._id) return;

    const onReceiveMessage = (message: Message) => {
      if (message.room_id === selectedRoom?.room_id) {
        setMessages((prev) => [...prev, message]);
      }
      setRooms((prev) =>
        prev.map((room) =>
          room.room_id === message.room_id
            ? { ...room, last_message: message }
            : room
        )
      );
    };

    const onUserOnline = ({
      status,
      userId,
    }: {
      status: string;
      userId: string;
    }) => {
      setRooms((prev) =>
        prev.map((room) => {
          return room.friend._id === userId
            ? {
                ...room,
                friend: {
                  ...room.friend,
                  status: status as "online" | "offline",
                },
              }
            : room;
        })
      );
    };

    const onMessagesRead = ({
      room_id,
      user_id,
    }: {
      room_id: string;
      user_id: string;
    }) => {
      if (room_id === selectedRoom?.room_id && user_id !== user._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id !== user_id && !msg.is_read
              ? { ...msg, is_read: true }
              : msg
          )
        );
      }
    };

    const onRecallMessage = ({
      message_id,
      room_id,
    }: {
      message_id: string;
      room_id: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === message_id
            ? {
                ...msg,
                is_recalled: true,
                content: "Tin nhắn đã bị thu hồi",
                imageUrl: undefined,
              }
            : msg
        )
      );
    };

    const onTyping = ({
      room_id,
      user_id,
    }: {
      room_id: string;
      user_id: string;
    }) => {
      if (room_id === selectedRoom?.room_id && user_id !== user._id) {
        setIsTyping(true);
      }
    };

    const onStopTyping = ({
      room_id,
      user_id,
    }: {
      room_id: string;
      user_id: string;
    }) => {
      if (room_id === selectedRoom?.room_id && user_id !== user._id) {
        setIsTyping(false);
      }
    };

    socket.on("SERVER_RETURN_MESSAGE", onReceiveMessage);
    socket.on("SERVER_RETURN_USER_ONLINE", onUserOnline);
    socket.on("SERVER_RETURN_MESSAGES_READ", onMessagesRead);
    socket.on("SERVER_RETURN_RECALL_MESSAGE", onRecallMessage);
    socket.on("SERVER_RETURN_TYPING", onTyping);
    socket.on("SERVER_RETURN_STOP_TYPING", onStopTyping);

    return () => {
      socket.off("SERVER_RETURN_MESSAGE", onReceiveMessage);
      socket.off("SERVER_RETURN_USER_ONLINE", onUserOnline);
      socket.off("SERVER_RETURN_MESSAGES_READ", onMessagesRead);
      socket.off("SERVER_RETURN_RECALL_MESSAGE", onRecallMessage);
      socket.off("SERVER_RETURN_TYPING", onTyping);
      socket.off("SERVER_RETURN_STOP_TYPING", onStopTyping);
    };
  }, [socket, user, selectedRoom]);

  // Cuộn khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!selectedRoom) return;
    const updated = rooms.find((r) => r.room_id === selectedRoom.room_id);
    if (
      updated &&
      JSON.stringify(updated.friend) !== JSON.stringify(selectedRoom.friend)
    ) {
      setSelectedRoom(updated);
    }
  }, [rooms]);

  return (
    <div className="max-h-screen bg-gray-50">
      {/* Loading & Error */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-500 mt-3">Đang tải...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex space-x-6 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-1/3 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Phòng trò chuyện
          </h2>
          {!loading && !error && rooms.length > 0 ? (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.room_id}
                  onClick={() => handleSelectRoom(room)}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors ${
                    selectedRoom?.room_id === room.room_id ? "bg-gray-100" : ""
                  }`}
                >
                  <img
                    src={room.friend.avatar_url || "default-avatar.png"}
                    alt={room.friend.full_name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {room.friend.full_name}
                      </p>
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          room.friend.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    {room.last_message && (
                      <p className="text-sm text-gray-500 truncate">
                        {room.last_message.is_recalled
                          ? "Tin nhắn đã bị thu hồi"
                          : room.last_message.sender_id === user?._id
                          ? `Bạn: ${room.last_message.content || "[Hình ảnh]"}`
                          : room.last_message.content || "[Hình ảnh]"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-gray-500 text-center">Chưa có phòng chat</p>
            )
          )}
        </div>

        {/* Chat Area */}
        <div className="w-2/3 bg-white rounded-lg border border-gray-200 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <img
                    src={selectedRoom.friend.avatar_url || "default-avatar.png"}
                    alt={selectedRoom.friend.full_name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedRoom.friend.full_name}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span
                        className={`inline-block h-2 w-2 rounded-full mr-1 ${
                          selectedRoom.friend.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      {selectedRoom.friend.status === "online"
                        ? "Đang hoạt động"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender_id === user?._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {msg.sender_id !== user?._id && (
                      <img
                        src={
                          selectedRoom.friend.avatar_url || "default-avatar.png"
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                    )}

                    <div
                      className={`max-w-xs rounded-xl p-3 shadow-sm ${
                        msg.is_recalled
                          ? "bg-gray-200 text-gray-500 italic"
                          : msg.sender_id === user?._id
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {/* HÌNH ẢNH */}
                      {msg.image_url && !msg.is_recalled && (
                        <div className="mb-2">
                          <img
                            src={msg.image_url}
                            alt="Sent"
                            className="w-full max-w-[200px] h-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.image_url, "_blank")}
                          />
                        </div>
                      )}

                      {/* NỘI DUNG */}
                      {msg.content && !msg.is_recalled && (
                        <p className="break-words">{msg.content}</p>
                      )}

                      {msg.is_recalled && (
                        <p className="text-xs">Tin nhắn đã bị thu hồi</p>
                      )}

                      <div className="flex justify-end">
                        {/* TRẠNG THÁI GỬI / ĐỌC */}
                        {msg.sender_id === user?._id && !msg.is_recalled && (
                          <p className="text-[11px] text-right mt-1 opacity-80">
                            {msg.is_read ? "Đã đọc" : "Đã gửi"}
                          </p>
                        )}

                        {/* NÚT THU HỒI (chỉ hiện cho người gửi) */}
                        {!msg.is_recalled && msg.sender_id === user?._id && (
                          <button
                            onClick={() => handleRecallMessage(msg._id)}
                            className="mt-1 text-xs opacity-70 hover:opacity-100 flex items-center gap-1 ml-3"
                          >
                            <Trash2Icon size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center text-sm text-gray-500 animate-pulse">
                    <div className="w-8 h-8 rounded-full mr-2 bg-gray-200 animate-pulse" />
                    <p>{selectedRoom.friend.full_name} đang nhập...</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 relative">
                <div className="flex items-center gap-2">
                  {/* Emoji */}
                  <button
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                  >
                    <Smile size={22} />
                  </button>

                  {/* Input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      debouncedHandleTyping();
                    }}
                    onKeyPress={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSendMessage()
                    }
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />

                  {/* Send */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-16 left-4 z-50 shadow-lg"
                  >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn một phòng để bắt đầu trò chuyện
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
