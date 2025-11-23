/*
 * Socket.IO Client for Real-time Updates
 */

import { io } from 'socket.io-client';

// Get Socket URL from environment variable or use current origin
const getSocketURL = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Otherwise, use current origin (works with Nginx proxy)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return 'http://localhost:3000';
};

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) {
    return socket;
  }

  // Get Socket URL at runtime (not at module load time)
  const socketURL = getSocketURL();
  console.log('🔌 Connecting to Socket.IO at:', socketURL); // Debug log

  socket = io(socketURL, {
    auth: {
      token,
    },
    // Add transport options for better compatibility
    transports: ['websocket', 'polling'],
    // Auto-reconnect on disconnect
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}

