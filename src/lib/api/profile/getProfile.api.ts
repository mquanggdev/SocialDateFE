import { callBackend } from "../auth.api";
import { useAuth } from "@/contexts/authContext";
import { User } from "@/types/user";
export async function getProfile(): Promise<User | null> {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const res = await callBackend("/profiles/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res) return null;
    if (res.user) return res.user as User;
    return res as User;
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    return null;
  }
}
