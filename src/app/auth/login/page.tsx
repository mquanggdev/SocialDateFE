import Link from "next/link";
import { LogIn } from "lucide-react";
import LoginForm from "@/components/auth/Login";
import AuthLayout from "@/components/auth/layouts/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Đăng Nhập Social Dating"
      subtitle="Chào mừng bạn trở lại, hãy tiếp tục hành trình của bạn 💕"
    >
      <LoginForm />
      <p className="mt-6 text-gray-600 text-center">
        Chưa có tài khoản?{" "}
        <Link href="/auth/register" className="text-pink-500 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthLayout>
  );
}
