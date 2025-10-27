import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-pink-500" />
          <span className="text-2xl font-bold text-pink-800">LoveConnect</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="px-4 py-2 text-pink-600 border border-pink-300 rounded-lg hover:bg-pink-50 transition">
            Đăng Nhập
          </Link>
          <Link href="/auth/register" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition">
            Đăng Ký
          </Link>
        </div>
      </nav>
    </header>
  );
}