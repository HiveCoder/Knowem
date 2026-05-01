import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim()
  if (configuredUrl) {
    return configuredUrl
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:3001'
  }

  return ''
}

export function getSocket() {
  const socketUrl = getSocketUrl()
  if (!socketUrl) {
    throw new Error('Missing VITE_SOCKET_URL. Configure the hosted Socket.io backend URL before deploying the frontend.')
  }

  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 8000,
      transports: ['websocket', 'polling'],
    })
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}
