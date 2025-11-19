/*
 * Socket.IO Client for Real-time Updates
 */

import { io } from 'socket.io-client';

// Get API URL from environment variable or use current origin's backend
// If frontend is on http://172.20.10.3:3001, backend should be on http://172.20.10.3:3000
const getSocketURL = () => {
  // If NEXT_PUBLIC_API_URL is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Otherwise, try to infer from current window location (runtime)
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If frontend is on port 3001, backend is likely on port 3000
    if (currentPort === '3001') {
      return `http://${currentHost}:3000`;
    }
    
    // Default to localhost:3000
    return 'http://localhost:3000';
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

