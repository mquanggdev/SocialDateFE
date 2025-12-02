
"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { showAlert } from "@/components/ui/Swal";
import { useRouter } from "next/navigation";

export default function Partner() {
  const { user } = useAuth();
  const router = useRouter();

  const handleCancelDating = async () => {
    try {
      const res = await fetch("/api/dating/cancel", { method: "POST" });
      if (res.ok) {
        showAlert({
          icon: "success",
          title: "Đã hủy hẹn hò",
          text: "Bạn đã độc thân trở lại!",
        });
        setTimeout(() => router.push("/dating"), 1500);
      }
    } catch (err) {
      showAlert({ icon: "error", title: "Lỗi khi hủy hẹn hò" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
        <Sparkles className="w-32 h-32 mx-auto text-yellow-500 mb-8 animate-pulse" />

        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8">
          Bạn đang hẹn hò!
        </h1>

        <p className="text-3xl font-medium text-gray-700 mb-4">Với</p>
        <p className="text-5xl font-bold text-pink-600 mb-12 tracking-wide">
          {user?.dating_partner || "Người ấy"}
        </p>

        <p className="text-2xl text-gray-600 mb-16">
          Chúc hai bạn mãi hạnh phúc bên nhau
        </p>

        <Button
          onClick={handleCancelDating}
          variant="destructive"
          size="lg"
          className="w-full h-20 text-3xl font-bold rounded-3xl hover:scale-105 transition-all"
        >
          Hủy hẹn hò
        </Button>
      </div>
    </div>
  );
}