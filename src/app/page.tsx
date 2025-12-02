import Link from "next/link";
import { Heart, Users, Shield, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white">
        <Header/>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-pink-800 mb-6 animate-fade-in">
              Tìm Kiếm Tình Yêu
              <span className="text-pink-500"> Thật Lòng</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-slide-up">
              Kết nối với những trái tim đồng điệu trong không gian hẹn hò an
              toàn và lãng mạn , thỏa sức đam mê với bạn bè
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition text-lg"
              >
                Bắt Đầu Hành Trình
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-pink-500 border border-pink-300 rounded-lg hover:bg-pink-50 transition text-lg"
              >
                Khám Phá
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-pink-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-pink-800 mb-4">
                Điều Đặc Biệt Ở LoveConnect
              </h2>
              <p className="text-xl text-gray-600">
                Trải nghiệm hẹn hò hiện đại với những tính năng độc đáo
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Users className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-pink-800 mb-2">
                  Kết Nối Thân Mật
                </h3>
                <p className="text-gray-600">
                  Chia sẻ trạng thái và khoảnh khắc với những người bạn chọn
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-pink-800 mb-2">
                  Hẹn Hò Lãng Mạn
                </h3>
                <p className="text-gray-600">
                  Tìm người phù hợp với bạn qua gợi ý thông minh
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Shield className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-pink-800 mb-2">
                  An Toàn Tuyệt Đối
                </h3>
                <p className="text-gray-600">
                  Dữ liệu cá nhân được bảo mật với công nghệ tiên tiến
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <Sparkles className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-pink-800 mb-2">
                  AI kiểm duyệt
                </h3>
                <p className="text-gray-600">
                  Môi trường lành mạnh 
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-pink-500">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Sẵn Sàng Gặp Gỡ Nửa Kia?
            </h2>
            <p className="text-xl text-pink-100 mb-8">
              Tham gia ngay để khám phá những kết nối tuyệt vời
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-pink-500 hover:bg-pink-50 font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Tham Gia Miễn Phí
            </Link>
          </div>
        </section>  
        <Footer/>
      </div>
    </div>
  );
}
