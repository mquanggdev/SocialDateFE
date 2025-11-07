import { Message } from "@/types/message";

export interface Rooms {
  room_id: string;
  friend: {
    _id: string;
    full_name: string;
    avatar_url?: string;
    status: "online" | "offline";
  };
  last_message?: {
    _id: string;
    room_id: string;
    sender_id: string;
    receiver_id: string;
    content?: string;
    image_url?: string;
    type: "text" | "both" | "image";
    is_read: boolean;
    is_recalled: boolean;
    timestamp: string;
  } | null;
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};
export const getRoomList = async (): Promise<Rooms[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/chats/rooms`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data.rooms;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi khi tải rooms.");
  }
};

export const getMessageWithRoomId = async (
  room_id: string
): Promise<Message[]> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_URL}/chats/message/${room_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.messages);
    }

    return data.messages;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi khi tải rooms.");
  }
};

interface SendMessageData {
  receiver_id: string;
  content: string;
  image_url: string;
}
export const sendMessage = async (
  dataSend: SendMessageData
): Promise<Message> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_URL}/chats/send-message`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataSend),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Lỗi gửi tin nhắn");
    }

    return data.newMessage; // ✅ đúng key với backend
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi gửi tin nhắn.");
  }
};
