// lib/api.ts
import { Post, GetPostsResponse } from "@/types/post";

const API_URL = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:5001";

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// GET /posts → LẤY DANH SÁCH + FILTER + PHÂN TRANG
export const getPosts = async (params: {
  type?: "all" | "myself" | "friends";
  search?: string;
  tags?: string;
  skip?: number;
  limit?: number;
}): Promise<GetPostsResponse> => {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  const url = new URL(`${API_URL}/posts`);
  
  // Thêm từng query param nếu có giá trị
  if (params.type) url.searchParams.append("type", params.type);
  if (params.search) url.searchParams.append("search", params.search);
  if (params.tags) url.searchParams.append("tags", params.tags);
  if (params.skip !== undefined) url.searchParams.append("skip", String(params.skip));
  if (params.limit !== undefined) url.searchParams.append("limit", String(params.limit));

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tải bài viết");

  return data; // { success, total, data: Post[] }
};

// POST /posts/create-post → TẠO BÀI VIẾT
export const createPost = async (formData: FormData): Promise<Post> => {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  const res = await fetch(`${API_URL}/posts/create-post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Không set Content-Type → browser tự thêm boundary
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi đăng bài");

  return data.data; 
};


export const deletePost = async (postId: string) => {
   const token = getAuthToken();
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Xóa thất bại");
  return data;
};