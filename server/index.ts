import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { GameEngine } from './gameEngine.js'
import { registerSocketHandlers } from './socketHandlers.js'

const app = express()
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []

function escapeRegexSegment(value: string) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

function createOriginMatcher(pattern: string) {
  if (!pattern.includes('*')) {
    return (origin: string) => origin === pattern
  }

  const source = `^${pattern.split('*').map(escapeRegexSegment).join('.*')}$`
  const expression = new RegExp(source)
  return (origin: string) => expression.test(origin)
}

const allowedOriginMatchers = configuredOrigins.map(createOriginMatcher)

function isOriginAllowed(origin?: string) {
  if (allowedOriginMatchers.length === 0 || !origin) {
    return true
  }

  return allowedOriginMatchers.some((matches) => matches(origin))
}

function corsOrigin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
  callback(null, isOriginAllowed(origin))
}

app.use(cors({ origin: corsOrigin, credentials: true }))
app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})

const engine = new GameEngine()
registerSocketHandlers(io, engine)

const port = Number(process.env.PORT || 3000)
httpServer.listen(port, () => {
  console.log(`Knowem server listening on http://localhost:${port}`)
})
