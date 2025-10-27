"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { validateAuth } from "@/helpers/validateAuth";
import { useAuth } from "@/contexts/authContext";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [generalError, setGeneralError] = useState<string>("");

  const { user, login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    const errors = validateAuth(email, password);

    if (errors.email) {
      setEmailError(errors.email);
      setLoading(false);
      return;
    }

    if (errors.password) {
      setPasswordError(errors.password);
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push("/feed");
    } catch (err) {
      setGeneralError("Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {emailError && (
          <p className="text-red-500 text-sm mt-1">{emailError}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Mật khẩu"
          className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      {/* General error */}
      {generalError && <p className="text-red-500 text-sm">{generalError}</p>}

      {/* Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition flex items-center justify-center space-x-2 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <LogIn className="w-5 h-5" />
        <span>{loading ? "Đang đăng nhập..." : "Đăng Nhập"}</span>
      </button>
    </form>
  );
}
