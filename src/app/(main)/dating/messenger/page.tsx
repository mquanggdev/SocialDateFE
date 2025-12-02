// app/dating/messenger/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  ArrowLeft,
  Smile,
  Trash2Icon,
  Sparkles,
} from "lucide-react";
import { Message } from "@/types/message";
import { getMessageWithRoomId } from "@/lib/api/chats/rooms";
import { useAuth } from "@/contexts/authContext";
import { useSocket } from "@/contexts/socketContext";
import { showConfirm } from "@/components/ui/Swal";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { CurrentMatch, getCurrentMatchChat } from "@/lib/api/datings/dating.api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function DatingMessenger() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [match, setMatch] = useState<CurrentMatch|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load match hiện tại
  const loadMatch = useCallback(async () => {
    try {
      const data = await getCurrentMatchChat();
      if (!data) {
        window.location.href = "/dating";
        return;
      }
      setMatch(data);

      // Load tin nhắn
      if (data.room_id) {
        const listMsg = await getMessageWithRoomId(data.room_id);
        setMessages(listMsg);
      }

      // Đếm ngược 7 ngày
      const updateTimer = () => {
        const diff = new Date(match?.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft("Đã hết hạn");
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${days} ngày ${hours}h ${mins}p`);
        }
      };
      updateTimer();
      const timer = setInterval(updateTimer, 60000);
      return () => clearInterval(timer);
    } catch (err) {
      console.error(err);
      window.location.href = "/dating";
    }
  }, []);



  // Gửi tin nhắn
  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !match || !user?._id) return;

    const message = {
      room_id: match.room_id,
      sender_id: user._id,
      receiver_id: match.partner._id,
      content: newMessage.trim(),
      type: "text" as const,
    };

    socket.emit("CLIENT_SEND_MESSAGE", message);
    setNewMessage("");
  };

  // Thu hồi tin nhắn
  const recallMessage = async (msgId: string) => {
    if (!socket || !match) return;
    const ok = await showConfirm({
      title: "Thu hồi tin nhắn?",
      text: "Tin nhắn sẽ bị xóa vĩnh viễn",
      icon: "warning",
    });
    if (ok) {
      socket.emit("CLIENT_RECALL_MESSAGE", {
        room_id: match.room_id,
        message_id: msgId,
        user_id: user?._id,
      });
    }
  };

  // Typing
  const handleTyping = () => {
    if (!socket || !match || !user?._id) return;
    socket.emit("CLIENT_TYPING", { room_id: match.room_id, user_id: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("CLIENT_STOP_TYPING", { room_id: match.room_id, user_id: user._id });
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

    useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  // Socket events
  useEffect(() => {
    if (!socket || !match?.room_id) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.room_id === match.room_id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("SERVER_RETURN_MESSAGE", handleNewMessage);
    socket.on("SERVER_RETURN_TYPING", handleTyping);
    socket.on("SERVER_RETURN_STOP_TYPING", handleStopTyping);

    return () => {
      socket.off("SERVER_RETURN_MESSAGE", handleNewMessage);
      socket.off("SERVER_RETURN_TYPING", handleTyping);
      socket.off("SERVER_RETURN_STOP_TYPING", handleStopTyping);
    };
  }, [socket, match?.room_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-3xl text-pink-600">Đang tải tin nhắn...</div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/dating")}
              className="p-3 rounded-full hover:bg-pink-100 transition-colors"
            >
              <ArrowLeft className="w-7 h-7 text-pink-600" />
            </button>

            <div className="flex items-center gap-5">
              {/* Avatar ẩn danh */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                  ?
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse"></div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800">{match.partner.full_name}</h1>
                <p className="text-lg text-pink-600 font-medium">
                  Chat ẩn danh • Còn lại:{" "}
                  <span className="font-bold text-purple-700">{timeLeft}</span>
                </p>
              </div>
            </div>
          </div>

          <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slow" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-5xl mx-auto px-6 py-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-32">
              <div className="text-9xl mb-8 opacity-20">Two Hearts</div>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">
                Bắt đầu cuộc trò chuyện nào!
              </h2>
              <p className="text-xl text-gray-500">
                Tin nhắn sẽ tự động xóa sau 7 ngày
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} mb-6`}
                >
                  {!isMe && (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex-shrink-0 mr-4 flex items-center justify-center text-white text-2xl font-bold">
                      ?
                    </div>
                  )}

                  <div
                    className={`max-w-lg px-6 py-4 rounded-3xl shadow-xl ${
                      isMe
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white border-2 border-purple-200 text-gray-800"
                    }`}
                  >
                    {msg.image_url && !msg.is_recalled && (
                      <img
                        src={msg.image_url}
                        alt="ảnh"
                        className="max-w-full rounded-2xl mb-3"
                      />
                    )}

                    {msg.content && (
                      <p className="text-lg leading-relaxed break-words">
                        {msg.is_recalled ? "Tin nhắn đã bị thu hồi" : msg.content}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <p className={`text-sm ${isMe ? "text-pink-100" : "text-gray-500"}`}>
                        {formatDistanceToNow(new Date(msg.timestamp), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>

                      {isMe && !msg.is_recalled && (
                        <button
                          onClick={() => recallMessage(msg._id)}
                          className="ml-4 opacity-70 hover:opacity-100"
                        >
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isMe && (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex-shrink-0 ml-4 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.full_name?.[0] || "B"}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-center gap-4 text-gray-500 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                ?
              </div>
              <p className="text-lg">Người lạ đang nhập...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-lg border-t-2 border-pink-200 sticky bottom-0">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEmoji((p) => !p)}
              className="p-3 rounded-full hover:bg-pink-100 transition-colors"
            >
              <Smile className="w-7 h-7 text-pink-600" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Nhắn tin cho Người lạ..."
              className="flex-1 px-6 py-5 text-lg rounded-full border-2 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all"
            />

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-8 h-8 text-white" />
            </button>
          </div>

          {showEmoji && (
            <div ref={emojiPickerRef} className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
              <EmojiPicker onEmojiClick={(e) => setNewMessage((p) => p + e.emoji)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}