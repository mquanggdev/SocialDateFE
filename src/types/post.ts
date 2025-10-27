export interface Post {
  _id: string; // ID của MongoDB
  user_id: string; // ID người dùng đăng ảnh
  image_url: string; // URL ảnh từ Cloudinary
  status?: string; // Status nhỏ đi kèm ảnh, optional
  tags: string[]; // Tag tự động từ AI (ví dụ: ["beach", "travel"])
  visibility: string[]; // Danh sách ID bạn bè được xem ảnh dưới dạng string
  reactions: {
    like: string[]; // Danh sách ID người dùng thả like
    heart: string[]; // Danh sách ID người dùng thả heart
  };
  created_at: string; // Date dạng string ISO
}
