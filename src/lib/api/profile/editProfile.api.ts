import { User } from "@/types/user";

export async function editProfile(formData: FormData): Promise<User> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/profiles/edit`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Cập nhật hồ sơ thất bại.");
    }

    return data.user as User;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error("Lỗi không xác định khi cập nhật hồ sơ.");
  }
}
