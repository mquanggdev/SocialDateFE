'use client'

import React, { createContext, useContext, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connectSocket: (token: string, userId: string) => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = async (token: string, userId: string) => {
    if (!token || !userId) {
      console.error('Thiếu token hoặc userId để kết nối Socket.io:', { token, userId });
      return;
    }

    if (socket && socket.connected) {
      console.log('Socket already connected:', socket.id);
      return;
    }

    try {
      const socketUrl = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:5000';
      console.log('Connecting to Socket.io at:', socketUrl);
      const newSocket = io(socketUrl, {
        auth: { token, userId },
        transports: ['websocket', 'polling'], // Ưu tiên WebSocket
        reconnectionAttempts: 3, // Giới hạn số lần thử lại
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        newSocket.emit('userLogin', { userId, token });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connect error:', error.message);
      });

      newSocket.on('error', ({ message }) => {
        console.error('Socket error:', message);
      });

      setSocket(newSocket);
    } catch (err) {
      console.error('Kết nối Socket thất bại:', err);
    }
  };

  const disconnectSocket = async () => {
    if (socket) {
      console.log('Disconnecting Socket.io:', socket.id);
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket phải được sử dụng trong SocketProvider');
  }
  return context;
};