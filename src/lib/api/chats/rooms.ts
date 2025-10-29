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
    content: string;
    type: "text" | "call";
    is_read: boolean;
    is_recalled: boolean;
    timestamp: string;
  };
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
