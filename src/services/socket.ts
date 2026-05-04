import { io, type Socket } from 'socket.io-client'

const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim()
export const SOCKET_URL = configuredSocketUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '')

const missingSocketUrlWarning = 'VITE_SOCKET_URL is not configured. Realtime features are disabled until you provide the hosted Socket.io backend URL in Vercel.'

let warningLogged = false

export const socket: Socket | null = SOCKET_URL
  ? io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 12000,
      transports: ['polling', 'websocket'],
    })
  : null

export function getSocketUrl() {
  return SOCKET_URL
}

export function getSocketWarning() {
  if (!SOCKET_URL && import.meta.env.PROD) {
    return missingSocketUrlWarning
  }

  if (!configuredSocketUrl && import.meta.env.DEV) {
    return 'VITE_SOCKET_URL is not set. Using the local development fallback at http://localhost:3000.'
  }

  return ''
}

export function getSocket() {
  const warning = getSocketWarning()
  if (warning && !warningLogged) {
    console.warn(warning)
    warningLogged = true
  }

  if (!socket) {
    return null
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}
