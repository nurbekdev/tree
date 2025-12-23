/*
 * Socket.IO Client for Real-time Updates
 */

import { io } from 'socket.io-client';

// Get Socket URL from environment variable or use current origin
// Nginx proxies /socket.io/* to backend, so we use relative URLs
const getSocketURL = () => {
  // Check if we have explicit API URL in environment (for development)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    // Client-side: check if localhost (development mode)
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // Development: backend runs on port 3000
      return 'http://localhost:3000';
    }
    
    // Production: use current origin (works with Nginx proxy)
    // Nginx handles /socket.io/* routing to backend
    return window.location.origin;
  }
  
  // Server-side fallback to production domain
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://nextree.app';
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

