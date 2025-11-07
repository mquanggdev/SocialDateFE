export interface Message {
  _id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  content?: string; // Tùy chọn
  image_url?: string; // Mảng URL hình ảnh
  type: "text" | "both" | "image"; // Thêm image
  is_read: boolean;
  is_recalled: boolean;
  timestamp: string;
}