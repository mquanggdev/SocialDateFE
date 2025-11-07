// app/(main)/feed/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Tag,
  Loader2,
  MessageCircle,
  Share2,
  ImagePlus,
  Bookmark,
  Trash2,
  Send,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useInView } from "react-intersection-observer";
import { usePosts } from "@/lib/hook/usePosts";
import { createPost } from "@/lib/api/posts/posts.api";
import { useDeletePost } from "@/lib/hook/useDeletePost";
import { useAuth } from "@/contexts/authContext";
import { showAlert, showConfirm } from "@/components/ui/Swal";

import { Post } from "@/types/post";

// Giả sử bạn có API tạo tin nhắn chat
import { sendMessage } from "@/lib/api/chats/rooms";

type TabKey = "all" | "myself" | "friends";

const ALL_TAGS = [
  "music", "travel", "reading", "cooking", "gaming", "fitness",
  "photography", "movies", "sports", "yoga", "dancing", "painting",
  "writing", "hiking", "cycling", "swimming", "gardening", "fashion",
  "technology", "pets", "crafts", "meditation", "baking", "boardgames",
  "fishing", "running", "knitting", "volunteering", "languages", "camping",
];

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // Chat popup
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatTargetPost, setChatTargetPost] = useState<Post | null>(null);
  const [sendingChat, setSendingChat] = useState(false);

  const { user } = useAuth();
  const myId = user?._id || "";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = usePosts({
    type: activeTab,
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const deleteMutation = useDeletePost();

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts: Post[] = data?.pages.flatMap((p) => p.data) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("image_url", file);
    if (uploadStatus.trim()) formData.append("status", uploadStatus.trim());

    try {
      await createPost(formData);
      setShowUpload(false);
      setUploadStatus("");
      setFile(null);
      setPreview("");
      refetch();
      showAlert({ icon: "success", title: "Đăng bài thành công!" });
    } catch (err: any) {
      showAlert({ icon: "error", title: err.message || "Lỗi đăng bài" });
    } finally {
      setUploading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDelete = async (postId: string) => {
    const confirmed = await showConfirm({
      icon: "warning",
      title: "Xóa bài viết?",
      text: "Hành động này không thể hoàn tác.",
      confirmText: "Xóa",
      cancelText: "Hủy",
    });
    if (confirmed) {
      deleteMutation.mutate(postId);
    }
  };

  // MỞ POPUP CHAT
  const openChatInput = (post: Post) => {
    if (post.user_id._id === myId) {
      showAlert({ icon: "info", title: "Bạn không thể nhắn cho chính mình!" });
      return;
    }
    setChatTargetPost(post);
    setShowChatInput(true);
    setChatMessage("");
  };

  // GỬI TIN NHẮN + ẢNH
  const sendChatMessage = async () => {
    if (!chatTargetPost || !chatMessage.trim()) return;

    setSendingChat(true);
    try {
      await sendMessage({
        receiver_id: chatTargetPost.user_id._id,
        content: chatMessage.trim(),
        image_url: chatTargetPost.image_url,
      });

      showAlert({ icon: "success", title: "Đã gửi tin nhắn!" });
      setShowChatInput(false);
      setChatMessage("");
      setChatTargetPost(null);
    } catch (err: any) {
      showAlert({ icon: "error", title: err.message || "Gửi thất bại" });
    } finally {
      setSendingChat(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 py-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:flex flex-col w-64 gap-4 sticky top-6 h-fit">
            {/* Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full bg-gray-50 border border-gray-200 text-sm focus:bg-white"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Lọc</h3>
              <div className="space-y-2">
                {[
                  { key: "all" as TabKey, label: "Tất cả" },
                  { key: "myself" as TabKey, label: "Của tôi" },
                  { key: "friends" as TabKey, label: "Bạn bè" },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setSearch("");
                        setSelectedTags([]);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-pink-500 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-pink-500" />
                Lọc theo tag
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ALL_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagClick(tag)}
                      className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-pink-600">
                      #{tag}
                    </span>
                  </label>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="mt-3 w-full text-xs text-pink-600 hover:text-pink-700 font-medium py-1"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            {/* Upload Box */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
              <div className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src={user.avatar_url || "/default-avatar.png"}
                    alt="Bạn"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                >
                  Bạn đang nghĩ gì?
                </button>
              </div>

              {showUpload && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <textarea
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value)}
                    placeholder="Viết chú thích..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    rows={4}
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <ImagePlus className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {preview && (
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
                      <img src={preview} alt="Preview" className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowUpload(false);
                        setUploadStatus("");
                        setFile(null);
                        setPreview("");
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={handleUpload}
                      disabled={uploading || !file}
                    >
                      {uploading ? "Đang đăng..." : "Đăng"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full bg-gray-50 border border-gray-200 text-sm focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "all" as TabKey, label: "Tất cả" },
                    { key: "myself" as TabKey, label: "Của tôi" },
                    { key: "friends" as TabKey, label: "Bạn bè" },
                  ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setSearch("");
                          setSelectedTags([]);
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                          isActive
                            ? "bg-pink-500 text-white"
                            : "bg-gray-50 text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4 text-pink-500" />
                  Lọc theo tag
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ALL_TAGS.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagClick(tag)}
                        className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-pink-600">
                        #{tag}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="mt-3 w-full text-xs text-pink-600 hover:text-pink-700 font-medium py-1"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading && (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    <p className="text-gray-500 mt-3">Đang tải bài viết...</p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex justify-center items-center py-16">
                  <p className="text-red-500">
                    {(error as Error)?.message || "Lỗi tải dữ liệu"}
                  </p>
                </div>
              )}

              {!isLoading && !isError && (
                <div className="space-y-0 divide-y divide-gray-200">
                  {posts.map((post) => {
                    const isOwner = post.user_id._id === myId;

                    return (
                      <div
                        key={post._id}
                        className="bg-white hover:bg-gray-50 transition-colors py-4 px-4"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              <img
                                src={post.user_id.avatar_url || "/default-avatar.png"}
                                alt={post.user_id.full_name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {post.user_id.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(post.created_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                          {isOwner && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(post._id)}
                                    disabled={deleteMutation.isPending}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Xóa bài viết</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Image */}
                        <div className="w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                          <img
                            src={post.image_url}
                            alt={post.status}
                            className="w-full h-auto max-h-96 object-cover"
                          />
                        </div>

                        {/* Caption */}
                        {post.status && (
                          <p className="text-gray-900 text-sm leading-relaxed mb-3">
                            {post.status}
                          </p>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="bg-pink-50 text-pink-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-pink-100 transition-colors"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between -mx-2 pt-2 border-t border-gray-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openChatInput(post)}
                            className="h-8 gap-2 px-3 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-xs font-medium">Cảm nghĩ của bạn...</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 gap-2 px-3 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              <div ref={loadMoreRef} className="h-10" />

              {isFetchingNextPage && (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-pink-500" />
                  <p className="text-gray-500 mt-2 text-sm">Đang tải thêm...</p>
                </div>
              )}

              {!hasNextPage && posts.length > 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Đã hết bài viết
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* CHAT POPUP */}
      {showChatInput && chatTargetPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Gửi tin nhắn cho</h3>
              <button
                onClick={() => setShowChatInput(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={chatTargetPost.user_id.avatar_url || "default-avatar.png"}
                  alt={chatTargetPost.user_id.full_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="font-medium text-gray-900">{chatTargetPost.user_id.full_name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <img
                src={chatTargetPost.image_url}
                alt="Post"
                className="w-full h-auto max-h-48 object-cover rounded-lg"
              />
            </div>

            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Viết cảm nghĩ của bạn..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChatInput(false)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={sendChatMessage}
                disabled={sendingChat || !chatMessage.trim()}
              >
                {sendingChat ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}