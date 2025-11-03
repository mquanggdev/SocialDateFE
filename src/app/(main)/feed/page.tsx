"use client";

import { useEffect, useState } from "react";
import { Search, Heart } from "lucide-react";

// Định nghĩa interface cho Post
interface IPost {
  _id: string;
  user_id: { _id: string; full_name: string; avatar_url: string };
  image_url: string;
  status: string;
  tags: string[];
  visibility: string[];
  reactions: { heart: { _id: string; full_name: string; avatar_url: string }[] };
  created_at: string;
}

// Mock data
const mockPosts: IPost[] = [
  {
    _id: "post1",
    user_id: {
      _id: "user1",
      full_name: "Nguyễn Văn A",
      avatar_url: "https://via.placeholder.com/40",
    },
    image_url: "https://via.placeholder.com/600x400?text=Beach",
    status: "Thư giãn tại bãi biển tuyệt đẹp!",
    tags: ["beach", "travel", "summer"],
    visibility: ["user2", "user3"],
    reactions: {
      heart: [
        { _id: "user2", full_name: "Trần Thị B", avatar_url: "https://via.placeholder.com/40" },
        { _id: "user3", full_name: "Lê Văn C", avatar_url: "https://via.placeholder.com/40" },
      ],
    },
    created_at: new Date("2025-10-28T10:00:00").toISOString(),
  },
  {
    _id: "post2",
    user_id: {
      _id: "user2",
      full_name: "Trần Thị B",
      avatar_url: "https://via.placeholder.com/40",
    },
    image_url: "https://via.placeholder.com/600x400?text=Mountain",
    status: "Leo núi cùng bạn bè, thật tuyệt!",
    tags: ["mountain", "hiking", "adventure"],
    visibility: ["user1", "user3"],
    reactions: {
      heart: [],
    },
    created_at: new Date("2025-10-27T15:30:00").toISOString(),
  },
  {
    _id: "post3",
    user_id: {
      _id: "user3",
      full_name: "Lê Văn C",
      avatar_url: "https://via.placeholder.com/40",
    },
    image_url: "https://via.placeholder.com/600x400?text=Cafe",
    status: "Chill tại quán cà phê yêu thích",
    tags: ["cafe", "relax", "city"],
    visibility: ["user1"],
    reactions: {
      heart: [{ _id: "user1", full_name: "Nguyễn Văn A", avatar_url: "https://via.placeholder.com/40" }],
    },
    created_at: new Date("2025-10-26T09:00:00").toISOString(),
  },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<IPost[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    full_name: string;
    avatar_url: string;
  } | null>({ _id: "user1", full_name: "Nguyễn Văn A", avatar_url: "https://via.placeholder.com/40" }); // Mock user

  // Lấy mock data
  useEffect(() => {
    setTimeout(() => {
      // Giả lập thời gian tải
      setPosts(mockPosts);
      setFilteredPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  // Lọc bài post theo tìm kiếm
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredPosts(posts);
      return;
    }
    const filtered = posts.filter(
      (post) =>
        post.user_id.full_name.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredPosts(filtered);
  };

  // Thả tim giả lập
  const handleHeartReaction = (postId: string) => {
    if (!currentUser) {
      setError("Vui lòng đăng nhập để thả tim");
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              reactions: {
                heart: post.reactions.heart.some((r) => r._id === currentUser._id)
                  ? post.reactions.heart.filter((r) => r._id !== currentUser._id)
                  : [...post.reactions.heart, currentUser],
              },
            }
          : post
      )
    );
    setFilteredPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              reactions: {
                heart: post.reactions.heart.some((r) => r._id === currentUser._id)
                  ? post.reactions.heart.filter((r) => r._id !== currentUser._id)
                  : [...post.reactions.heart, currentUser],
              },
            }
          : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col">
        {/* Thanh tìm kiếm */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết (theo tên hoặc tag)..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Loading và Error */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="text-gray-500 mt-3">Đang tải...</p>
          </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Feed */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
              Feed
            </h2>
            <div className="p-4 space-y-6">
              {filteredPosts.length === 0 && (
                <p className="text-gray-500 text-center">
                  Không tìm thấy bài viết
                </p>
              )}
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={post.user_id.avatar_url || "default-avatar.png"}
                      alt={post.user_id.full_name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.user_id.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <img
                    src={post.image_url || "/fallback-image.png"}
                    alt="Post"
                    className="w-full h-64 object-cover rounded-lg mb-2"
                  />
                  {post.status && (
                    <p className="text-gray-700 mb-2">{post.status}</p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleHeartReaction(post._id)}
                      className={`flex items-center space-x-1 ${
                        post.reactions.heart.some((r) => r._id === currentUser?._id)
                          ? "text-red-500"
                          : "text-gray-500"
                      } hover:text-red-500`}
                      disabled={!currentUser}
                    >
                      <Heart
                        size={20}
                        fill={
                          post.reactions.heart.some((r) => r._id === currentUser?._id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      <span>{post.reactions.heart.length}</span>
                    </button>
                    {post.user_id._id === currentUser?._id &&
                      post.reactions.heart.length > 0 && (
                        <div className="text-sm text-gray-500">
                          Thả tim bởi:
                          {post.reactions.heart.map((reactor) => (
                            <span key={reactor._id} className="ml-1">
                              {reactor.full_name},
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


