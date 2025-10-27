import Swal from "sweetalert2";

interface FireOptions {
  icon?: "success" | "error" | "warning" | "info" | "question";
  title: string;
  text?: string;
}

// Tạo Toast mặc định (popup nhỏ ở góc)
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/**
 * Hàm hiển thị thông báo dạng toast ngắn gọn
 * @param options { icon, title, text }
 */
export function showToast(options: FireOptions) {
  Toast.fire({
    icon: options.icon || "success",
    title: options.title,
    text: options.text,
  });
}

/**
 * Hàm hiển thị thông báo dạng modal lớn (có nút OK)
 * Dùng khi cần yêu cầu người dùng xác nhận hoặc thông báo lỗi nghiêm trọng
 */
export function showAlert(options: FireOptions) {
  Swal.fire({
    icon: options.icon || "info",
    title: options.title,
    text: options.text,
    confirmButtonColor: "#ec4899", // màu hồng đồng bộ theme của bạn
  });
}

/**
 * Hàm hiển thị confirm (OK/Cancel)
 * @returns Promise<boolean>
 */
export async function showConfirm(options: FireOptions & { confirmText?: string; cancelText?: string }) {
  const result = await Swal.fire({
    icon: options.icon || "question",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmText || "Xác nhận",
    cancelButtonText: options.cancelText || "Hủy",
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#6b7280",
  });

  return result.isConfirmed;
}
