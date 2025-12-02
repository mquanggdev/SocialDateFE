import Link from "next/link";
import AuthLayout from "@/components/auth/layouts/AuthLayout";
import RegisterForm from "@/components/auth/Register";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Đăng Ký Social Dating"
      subtitle="Tạo tài khoản để bắt đầu hành trình tìm kiếm tình yêu của bạn 💖"
    >
      <RegisterForm />
      <p className="mt-6 text-gray-600 text-center">
        Đã có tài khoản?{" "}
        <Link href="/auth/login" className="text-pink-500 hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </AuthLayout>
  );
}
