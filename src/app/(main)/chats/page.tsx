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
} from "lucide-react";
import { Message } from "@/types/message";
import {
  getMessageWithRoomId,
  getRoomList,
  Rooms,
} from "@/lib/api/chats/rooms";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import Swal from "sweetalert2";
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
  const { user, isLoading } = useAuth();
  const { socket } = useSocket();

  // Hàm debounce tự viết
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

  // Cuộn xuống cuối khi có tin nhắn mới
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

  // Lấy danh sách tin nhắn theo room_id
  const fetchMessages = useCallback(
    async (room_id: string) => {
      try {
        setLoading(true);
        const listMessage = await getMessageWithRoomId(room_id);
        setMessages(listMessage);

        // Đánh dấu tin nhắn đã đọc
        if (socket && user?._id) {
          socket.emit("CLIENT_MARK_MESSAGES_READ", {
            room_id,
            user_id: user._id,
          });
        }
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
    setIsTyping(false);
    setIsTypingSent(false);
    if (room.room_id) {
      fetchMessages(room.room_id);
    } else {
      setError("Không tìm thấy phòng chat");
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!user || !user._id || !socket || !selectedRoom || !newMessage.trim()) {
      setError("Vui lòng chọn phòng và nhập tin nhắn");
      return;
    }

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
        prev.map((room) =>
          room.room_id === selectedRoom.room_id
            ? { ...room, last_message: fakeMsg }
            : room
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
      title: "Bạn có chắc muốn xóa?",
      text: "Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
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

  // Xử lý typing
  const handleTyping = () => {
    if (!socket || !selectedRoom || !user?._id || isTypingSent) return;
    socket.emit("CLIENT_TYPING", {
      room_id: selectedRoom.room_id,
      user_id: user._id,
    });
    setIsTypingSent(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
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

  // Đóng EmojiPicker khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  // Fetch danh sách phòng khi user đăng nhập
  useEffect(() => {
    if (user && !isLoading) {
      fetchRooms();
    }
  }, [fetchRooms, user, isLoading]);

  // Xử lý sự kiện socket
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
        prev.map((room) =>
          room.friend._id === userId
            ? {
                ...room,
                friend: {
                  ...room.friend,
                  status: status as "online" | "offline",
                },
              }
            : room
        )
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
            ? { ...msg, is_recalled: true, content: "Tin nhắn đã bị thu hồi" }
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="max-h-screen bg-gray-50">
      {/* Loading & Error */}
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex space-x-6 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-1/3 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Phòng trò chuyện
          </h2>
          {!loading && !error && (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.room_id}
                  onClick={() => handleSelectRoom(room)}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
                    selectedRoom?.room_id === room.room_id ? "bg-gray-100" : ""
                  }`}
                >
                  <img
                    src={room.friend.avatar_url || "default-avatar.png"}
                    alt={room.friend.full_name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">
                        {room.friend.full_name}
                      </p>
                      <span
                        className={`ml-2 inline-block h-2 w-2 rounded-full ${
                          room.friend.status === "online"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    {room.last_message && (
                      <p className="text-sm text-gray-500 truncate">
                        {room.last_message.sender_id === user?._id
                          ? `Bạn: ${room.last_message.content}`
                          : room.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="w-2/3 bg-white rounded-lg border border-gray-200 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="flex p-4 border-b border-gray-200">
                <img
                  src={selectedRoom.friend.avatar_url || "default-avatar.png"}
                  alt={selectedRoom.friend.full_name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h2 className="text-lg font-semibold text-gray-900 mt-2.5">
                  {selectedRoom.friend.full_name}
                  <span
                    className={`ml-2 inline-block h-2 w-2 rounded-full ${
                      selectedRoom.friend.status === "online"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`mb-4 flex ${
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
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.is_recalled
                          ? "bg-gray-200 text-gray-500 italic"
                          : msg.sender_id === user?._id
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>
                        {msg.content}
                        {!msg.is_recalled && msg.sender_id === user?._id && (
                          <button
                            onClick={() => handleRecallMessage(msg._id)}
                            className="ml-2 text-gray-500 hover:text-red-500"
                          >
                            <EllipsisVertical size={16} />
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <p className="text-sm text-gray-500 animate-pulse">
                    {selectedRoom.friend.full_name} đang nhập...
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 flex items-center relative">
                {/* Emoji Button */}
                <button
                  onClick={() => setShowEmoji((prev) => !prev)}
                  className="p-2 mr-2 text-gray-500 hover:text-pink-500"
                >
                  <Smile size={22} />
                </button>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-14 left-4 z-50"
                  >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    debouncedHandleTyping();
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  <Send size={20} />
                </button>
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
