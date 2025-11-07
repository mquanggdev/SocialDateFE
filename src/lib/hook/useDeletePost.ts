// lib/hook/useDeletePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost as deletePostApi } from "@/lib/api/posts/posts.api";
import { showAlert } from "@/components/ui/Swal";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePostApi(postId),
    onSuccess: () => {
      // Xóa khỏi cache
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showAlert({ icon: "success", title: "Đã xóa bài viết!" });
    },
    onError: (error: any) => {
      showAlert({ icon: "error", title: error.message || "Xóa thất bại" });
    },
  });
};