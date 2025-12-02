"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  UserCheck,
  UserX,
  Hourglass,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { showAlert } from "@/components/ui/Swal";
import {
  getDatingCandidates,
  likeUser,
  unlike,
  getCurrentMatchChat,
  acceptMatch,
  rejectMatch,
  cancelDating,
} from "@/lib/api/datings/dating.api";
import { useRouter } from "next/navigation";

interface Candidate {
  _id: string;
  full_name: string;
  address: string;
  bio: string;
  interests: string[];
  similarity: number;
  liked_me: boolean;
  is_my_pending?: boolean;
}

interface CurrentMatch {
  match_id: string;
  room_id: string;
  partner_name: string;
  partner_id: string;
}

export default function DatingPage() {
  const { user } = useAuth(); // ← LẤY refreshUser
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState<CurrentMatch | null>(null);
  const [loading, setLoading] = useState(true);


  // Load danh sách + match
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [candidatesData, matchData] = await Promise.all([
        getDatingCandidates(),
        getCurrentMatchChat(),
      ]);

      setCandidates(candidatesData);
      const pendingPerson = candidatesData.find((p: any) => p.is_my_pending);
      setPendingId(pendingPerson?._id || null);

      if (matchData) {
        setCurrentMatch({
          match_id: matchData.match_id,
          room_id: matchData.room_id,
          partner_name: matchData.partner.full_name,
          partner_id: matchData.partner._id,
        });
      } else {
        setCurrentMatch(null);
      }
    } catch (err: any) {
      showAlert({ icon: "error", title: "Lỗi tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Like
  const handleLike = async (targetId: string) => {
    try {
      const result = await likeUser(targetId);
      if (result.match) {
        showAlert({
          icon: "success",
          title: "IT'S A MATCH!",
          text: "Hai bạn đã thích nhau!",
          timer: 4000,
        });
        const newMatch = await getCurrentMatchChat();
        if (newMatch) {
          setCurrentMatch({
            match_id: newMatch.match_id,
            room_id: newMatch.room_id,
            partner_name: newMatch.partner.full_name,
            partner_id: newMatch.partner._id,
          });
        }
        setPendingId(null);
      } else {
        setPendingId(targetId);
        showAlert({
          icon: "info",
          title: "Đã gửi thích!",
          text: "Đang chờ...",
        });
      }
    } catch (err: any) {
      showAlert({ icon: "error", title: err.message || "Lỗi" });
    }
  };

  const handleCancelLike = async (targetId: string) => {
    if (!pendingId) return;
    await unlike(targetId);
    setPendingId(null);
    showAlert({ icon: "info", title: "Đã hủy thích" });
  };

  const goToChat = () => {
    if (currentMatch?.room_id) router.push("/dating/messenger");
  };

  // ĐỒNG Ý HẸN HÒ → REFRESH USER NGAY
  const handleAcceptMatch = async () => {
    try {
      const result = await acceptMatch();
      if (result?.bothAccept) {
        showAlert({
          icon: "success",
          title: "Chúc mừng cặp đôi mới!",
          text: "Hai bạn chính thức đang hẹn hò!",
          timer: 3000,
        });
      }
    } catch (err: any) {
      showAlert({ icon: "error", title: "Lỗi khi chấp nhận" });
    }
  };

  const handleRejectMatch = async () => {
    await rejectMatch();
    setCurrentMatch(null);
    setPendingId(null);
    showAlert({ icon: "info", title: "Đã từ chối match" });
    loadData();
  };

  // HỦY HẸN HÒ
  const handleCancelDating = async () => {
    try {
      const res = await cancelDating();
    } catch (err) {
      showAlert({ icon: "error", title: "Lỗi khi hủy" });
    }
  };

  // ==================================================================
  // 1. ĐANG HẸN HÒ → HIỂN THỊ MÀN HÌNH RIÊNG
  // ==================================================================
  if (user?.is_dating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full text-center">
          <Sparkles className="w-32 h-32 mx-auto text-yellow-500 mb-8 animate-pulse" />

          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8">
            Bạn đang hẹn hò!
          </h1>

          <p className="text-3xl font-medium text-gray-700 mb-4">Với</p>
          <p className="text-5xl font-bold text-pink-600 mb-12 tracking-wide">
            {user.dating_partner || "Người ấy"}
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

  // ==================================================================
  // 2. Đang loading
  // ==================================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-4xl font-bold text-pink-600 animate-pulse">
          Đang tìm người phù hợp...
        </div>
      </div>
    );
  }

  // ==================================================================
  // 3. Không có người nào
  // ==================================================================
  if (candidates.length === 0 && !currentMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <p className="text-3xl text-gray-600 mb-4">Chưa có ai phù hợp</p>
          <p className="text-lg text-gray-500">Quay lại sau nhé!</p>
        </div>
      </div>
    );
  }

  // ==================================================================
  // 4. GIAO DIỆN CHÍNH – DANH SÁCH
  // ==================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          Tìm người phù hợp
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {candidates.map((person) => {
            const isPending = person._id === pendingId;
            const isMatched = currentMatch?.partner_id === person._id;
            const isOtherCardDisabled =
              (pendingId || currentMatch) && !isPending && !isMatched;

            return (
              <div
                key={person._id}
                className={`transition-all duration-700 ${
                  isOtherCardDisabled
                    ? "opacity-30 scale-90 pointer-events-none select-none blur-sm"
                    : "opacity-100 scale-100"
                }`}
              >
                <div
                  className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 relative ${
                    isMatched
                      ? "ring-8 ring-yellow-400 ring-opacity-60 shadow-yellow-300/50"
                      : ""
                  }`}
                >
                  <div className="relative h-96 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 flex items-center justify-center overflow-hidden">
                    <span className="text-white text-11xl font-bold opacity-20 select-none">
                      {person.full_name[0]}
                    </span>

                    {isMatched && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white animate-bounce">
                          <Sparkles className="w-32 h-32 mx-auto mb-6" />
                          <p className="text-5xl font-extrabold drop-shadow-2xl">
                            IT'S A MATCH!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-10">
                    <h2 className="text-4xl font-bold text-center mb-3 text-gray-800">
                      {person.full_name}
                    </h2>
                    <p className="text-center text-gray-600 text-lg mb-8">
                      {person.address}
                    </p>

                    <div className="text-center mb-8">
                      <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                        {person.similarity}%
                      </div>
                      <p className="text-base text-gray-500 mt-2">
                        phù hợp sở thích
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center mb-8">
                      {person.interests.slice(0, 6).map((tag, i) => (
                        <span
                          key={i}
                          className="px-5 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {person.liked_me && !isPending && !isMatched && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 mb-8">
                        <p className="text-green-700 font-bold text-center text-xl">
                          Người này đã thích bạn!
                        </p>
                      </div>
                    )}

                    {/* NÚT HÀNH ĐỘNG */}
                    {isMatched ? (
                      <div className="space-y-5 mt-10">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full h-20 text-2xl font-bold border-red-500 text-red-600 hover:bg-red-50"
                          onClick={handleRejectMatch}
                        >
                          <UserX className="w-10 h-10 mr-4" /> Từ chối
                        </Button>

                        <Button
                          size="lg"
                          className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          onClick={goToChat}
                        >
                          <MessageCircle className="w-10 h-10 mr-4" /> Nhắn tin
                          ngay
                        </Button>

                        <Button
                          size="lg"
                          className="w-full h-20 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-xl"
                          onClick={handleAcceptMatch}
                        >
                          <UserCheck className="w-10 h-10 mr-4" /> Đồng ý hẹn hò
                        </Button>
                      </div>
                    ) : isPending ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-20 text-2xl font-bold border-pink-500 text-pink-600 hover:bg-pink-50 border-2"
                        onClick={() => handleCancelLike(person._id)}
                      >
                        <Hourglass className="w-10 h-10 mr-4" /> Đang chờ...
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => handleLike(person._id)}
                        className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-2xl"
                      >
                        <Heart className="w-11 h-11 mr-4" /> Thích
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
