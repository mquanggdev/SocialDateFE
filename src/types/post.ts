// types/post.ts
export interface User {
  _id: string;
  full_name: string;
  avatar_url: string;
  status: "online" | "offline" | "busy";
}
export interface Post {
  _id: string;
  user_id: User;
  image_url: string;
  status?: string;
  tags: string[];
  created_at: string;
}

export interface GetPostsResponse {
  data: Post[];
  hasMore: boolean;
}
