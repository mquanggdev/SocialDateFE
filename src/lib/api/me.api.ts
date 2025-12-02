
import { User } from "@/types/user"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}
export const getMe = async (): Promise<User> => {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.")
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    return data.user;
  } catch (err) {
    throw err instanceof Error ? err : new Error("Lỗi không xác định khi tải thông tin người dùng")
  }
}