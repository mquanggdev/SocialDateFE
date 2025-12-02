"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/user";
import { callBackend } from "@/lib/api/auth.api";
import { useSocket } from "./socketContext";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api/me.api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  token: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { connectSocket, disconnectSocket } = useSocket();


  // Kiểm tra auth lúc đầu
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = await getMe();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          connectSocket(savedToken, savedUser._id);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await callBackend("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      setToken(data.token);
      connectSocket(data.token, data.user._id);

      router.push("/"); // hoặc trang chủ
    } catch (error) {
      throw new Error("Đăng nhập thất bại");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await callBackend("/users/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // Có thể tự động login luôn nếu muốn
    } catch (error) {
      throw new Error("Đăng ký thất bại");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    setToken("");
    disconnectSocket();
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}