"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-white flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-pink-800 mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
        )}
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100">
          {children}
        </div>
      </main>
    </div>
  );
}
