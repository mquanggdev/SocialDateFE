import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-pink-800 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Heart className="w-6 h-6 text-pink-300" />
          <span className="text-xl font-bold">Social Dating</span>
        </div>
        <p className="text-pink-200">
          © 2025 Social Dating. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
}