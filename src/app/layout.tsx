import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";
import { SocketProvider } from "@/contexts/socketContext";
import { QueryProvider } from "@/contexts/QueryProvider";
export const metadata: Metadata = {
  title: "Social Date",
  description: "It is a blessing to have friends and a partner.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
