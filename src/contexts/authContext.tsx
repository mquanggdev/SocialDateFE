"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/user";
import { callBackend } from "@/lib/api/auth.api";
import { useSocket } from "./socketContext";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  token : string;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token , setToken] = useState<string>("");
  const router = useRouter();
  const { connectSocket, disconnectSocket } = useSocket();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          setToken(token) ;
          const userData = localStorage.getItem("userData");
          if (userData) {
            const parserUser = JSON.parse(userData);
            setUser(parserUser);
            connectSocket(token, parserUser._id);
          }
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

      // Giả sử backend trả về { token, user }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      setUser(data.user);
      disconnectSocket();
      connectSocket(data.token, data.user._id);
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Đăng nhập thất bại");
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await callBackend("/users/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.error("Register failed:", error);
      throw new Error("Đăng ký thất bại");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    disconnectSocket();
    router.replace("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading ,token}}>
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
