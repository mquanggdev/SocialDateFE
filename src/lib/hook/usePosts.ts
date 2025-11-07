// hooks/usePosts.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "../api/posts/posts.api";
import { GetPostsResponse } from "@/types/post";

interface Params {
  type: "all" | "myself" | "friends";
  search?: string;
  tags?: string[];
}

export const usePosts = ({ type, search, tags }: Params) => {
  return useInfiniteQuery<GetPostsResponse, Error>({
    queryKey: ["posts", type, search, tags],
    queryFn: async ({ pageParam = 0 }) => {
      return await getPosts({
        type,
        search,
        tags: tags?.join(","),
        skip: pageParam as number,
        limit: 10,
      });
    },
    // BẮT BUỘC: React Query v5
    initialPageParam: 0,

    // Tính skip cho trang tiếp theo
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.data.length : undefined;
    },

    staleTime: 1000 * 60,
    retry: 1,
  });
};
