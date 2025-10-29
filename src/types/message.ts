export interface Message {
  _id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: "text" | "call";
  is_read: boolean;
  is_recalled: boolean;
  timestamp: string;
}